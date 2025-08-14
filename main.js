const jobManager = require('jobManagement.jobManager');
const jobEvents = require('jobManagement.jobEvents');

//import {JobTypes, jobsMap} from 'jobManagement.jobTypes.js';
const {JobTypes, jobsMap} = require('jobManagement.jobTypes');

const jobMiner = require('jobManagement.role.miner');
const jobBuilder = require('jobManagement.role.builder');
const jobUpgrader = require('jobManagement.role.upgrader');
//const jobHauler = require('job.hauler');
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

    //minimum jobs
    //-miners
    var miners = _.filter(Game.creeps, (creep) => creep.memory.job == JobTypes.MINE);
    if (miners.length < 3) {
        let newName = JobTypes.MINE + 'r' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
            {memory: {job: JobTypes.MINE}});
    }

    //-upgrader
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.job == JobTypes.UPGRADE);
    if (upgraders.length < 5) {
        let newName = JobTypes.UPGRADE + 'r' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
            {memory: {job: JobTypes.UPGRADE}});
    }

    //-builders
    var builders = _.filter(Game.creeps, (creep) => creep.memory.job == JobTypes.BUILD);
    if (builders.length < 2) {
        let newName = JobTypes.BUILD + 'r' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
            {memory: {job: JobTypes.BUILD}});

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
        for (let s in room.find(FIND_SOURCES)) {
            buildRoadBetween(spawn.pos, s.pos);
        }

    }

    //Jobs
    jobManager.initMemory();

    //-Jobs: Detect changes & update job list
    jobEvents.run();

    // Assign idle creeps to jobs
    jobManager.assignJobs();

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