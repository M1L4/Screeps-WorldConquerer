const jobManager = require('jobManagement.jobManager');
const jobEvents = require('jobManagement.jobEvents');

//import {JobTypes, jobsMap} from 'jobManagement.jobTypes.js';
const {JobTypes, jobsMap} = require('jobManagement.jobTypes');

/*const jobMiner = require('jobManagement.role.miner');
const jobBuilder = require('jobManagement.role.builder');
const jobUpgrader = require('jobManagement.role.upgrader');
const jobHauler = require('jobManagement.role.hauler');*/
//repair

const stats = require('monitoring.stats');


function buildRoadBetween(pos1, pos2) {
    var path = pos1.findPathTo(pos2, {ignoreCreeps: true});
    for (let step of path) {
        Game.rooms[pos1.roomName].createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
    }
}


module.exports.loop = function () {
    Game.cpu.generatePixel()

    //clean memory - check for death
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    stats.run();

    // === JOB PIPELINE (detect → release dead → assign) BEFORE counting & spawning ===
    jobManager.initMemory();
    jobEvents.run(); // Detect new/removed sources, controller, haul targets, construction sites
    jobManager.releaseJobsOfDeadCreeps();
    jobManager.assignJobs(); // Assign jobs to idle creeps

    //minimum jobs
    //-miners
    //var miners = _.filter(Game.creeps, (creep) => creep.memory.job == JobTypes.MINE);
    //const miners = _.filter(Game.creeps, creep => jobManager.getJobForCreep(creep)?.type) === JobTypes.MINE;
    //const miners = _.filter(Game.creeps, creep => (jobManager.getJobForCreep(creep)?.type) === JobTypes.MINE);
    const miners = _.filter(Game.creeps, c => {
        const j = jobManager.getJobForCreep(c); // returns job or null
        return j && j.type === JobTypes.MINE;
    });
    if (miners.length < 3) {
        let newName = JobTypes.MINE + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName);
    }

    //-upgrader
    //var upgraders = _.filter(Game.creeps, (creep) => creep.memory.job == JobTypes.UPGRADE);
    const upgraders = _.filter(Game.creeps, c => {
        const j = jobManager.getJobForCreep(c);
        return j && j.type === JobTypes.UPGRADE;
    });
    if (upgraders.length < 5) {
        let newName = JobTypes.UPGRADE + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName);
    }

    //-builders
    //var builders = _.filter(Game.creeps, (creep) => creep.memory.job == JobTypes.BUILD);
    const builders = _.filter(Game.creeps, c => {
        const j = jobManager.getJobForCreep(c);
        return j && j.type === JobTypes.BUILD;
    });
    if (builders.length < 2) {
        let newName = JobTypes.BUILD + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName);

    }

    //spawn - print
    if (Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        console.log('New spawn: ' + spawningCreep.name);

        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.job,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }


    //tower logic mini
    var tower = Game.getObjectById('0d6b45f476c1845ae53ece26');
    if (tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    }

    //construction
    var spawn = Game.spawns['Spawn1']
    var room = spawn.room;
    var controllerPos = room.controller.pos;
    var source = controllerPos.findClosestByRange(FIND_SOURCES_ACTIVE);

    if (source) {
        //controller - closest source
        buildRoadBetween(controllerPos, source.pos);
        //controller - spawn
        buildRoadBetween(controllerPos, spawn.pos);

        //spawn - 2sources
        for (let s in room.find(FIND_SOURCES)) {
            buildRoadBetween(spawn.pos, s.pos);
        }

    }


    // Run creeps
    for (const creep of Object.values(Game.creeps)) {
        const job = jobManager.getJobForCreep(creep);
        if (!job) {
            creep.say('Idle');
            continue;
        }
        const jobHandler = jobsMap[job.type];
        if (jobHandler) {
            jobHandler.run(creep, job);
        } else {
            creep.say('Unknown');
        }
    }
}