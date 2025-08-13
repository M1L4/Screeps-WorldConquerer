var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
const stats = require('stats');

/**
 * Monkey-patches Creep.prototype.harvest to precisely count mined resources.
 * Only increments when a real harvest occurs (not withdraw/pickup/transfer).
 * Counts per-tick totals into Memory.stats.harvestTickEnergy / harvestTickMinerals.
 * This patch is applied once per global reset.
 * It is creep unspecified - every creep that does mining on a sidejob should be counted as well.
 */
(function patchHarvestCounting() {
    if (global.__stats_harvest_patched) return;

    console.log("---HarvestingPatch triggered!---");
    global.__stats_harvest_patched = true;

    const originalHarvest = Creep.prototype.harvest;

    Creep.prototype.harvest = function (target) {
        // Ensure Memory slots exist
        Memory.stats = Memory.stats || {};
        if (typeof Memory.stats.harvestTickEnergy !== "number") Memory.stats.harvestTickEnergy = 0;
        if (typeof Memory.stats.harvestTickMinerals !== "number") Memory.stats.harvestTickMinerals = 0;

        // Determine which resource to observe before/after
        const isMineral = !!target.mineralType; // Mineral objects have .mineralType; Sources don't
        const resourceType = isMineral ? target.mineralType : RESOURCE_ENERGY;

        const before = this.store.getUsedCapacity(resourceType) || 0;
        const result = originalHarvest.call(this, target);
        if (result === OK) {
            // After harvest, store has been updated in the same tick
            const after = this.store.getUsedCapacity(resourceType) || 0;
            const gained = Math.max(0, after - before);
            if (gained > 0) {
                if (isMineral) {
                    Memory.stats.harvestTickMinerals += gained;
                } else {
                    Memory.stats.harvestTickEnergy += gained;
                }
            }
        }
        return result;
    };
})();


function buildRoadBetween(pos1, pos2) {
    var path = pos1.findPathTo(pos2, { ignoreCreeps: true });
    for (let step of path) {
        Game.rooms[pos1.roomName].createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
    }
}

module.exports.loop = function () {
    Game.cpu.generatePixel()
    
    //console.log("---Tick: ", Game.time, "---");

    //clean memory - check for death
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    stats.run();
    

    //minimum roles
    //-harvesters
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    //console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 3) {
        let newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'harvester'}});
    }

    //-upgrader
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    //console.log('Upgraders: ' + upgraders.length);

    if(upgraders.length < 5) {
        let newName = 'Upgrader' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'upgrader'}});
    }

    //construction
    var room = Game.rooms['E3S19']
    var controllerPos = room.controller.pos;
    var spawn = Game.spawns['Spawn1']
    var source = controllerPos.findClosestByRange(FIND_SOURCES_ACTIVE);

    if (source) {
        //controller - closest source
        buildRoadBetween(controllerPos, source.pos);
        //controller - spawn
        buildRoadBetween(controllerPos, spawn.pos);

        //spawn - 2sources
        for(let s in room.find(FIND_SOURCES)) {
            buildRoadBetween(spawn.pos, s.pos);
        }

    }


    //-builders
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    //console.log('Builders: ' + builders.length);

    if(builders.length < 2) {
        let newName = 'Builder' + Game.time;
        console.log('Spawning new builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'builder'}});

    }

    //spawn - print
    if(spawn.spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }


    var tower = Game.getObjectById('0d6b45f476c1845ae53ece26');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }


    //run creeps
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}