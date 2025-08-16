/**
 * Main game loop for Screeps.
 * Starts up everything
 * @module main
 */

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


//---imports---
//job related
const jobManager = require('jobMgt-jobMgr');
const jobEvents = require('jobMgt-jobCentre');
const {JobTypes, jobsMap} = require('jobMgt-jobTypes');

//monitoring
const stats = require('monitoring-stats');

//better readability exports
const towerManager = require('towerMgr');
const memoryMgr = require('memoryMgr');
const labelMgr = require('labelMgr');
const constructionPlanner = require('buildMgr');

//main method
module.exports.loop = function () {
    //---1. preparation---

    //generate pixels for decorations
    Game.cpu.generatePixel()

    //clean memory - check for death
    memoryMgr.cleanUp()

    //print metrics for comparison
    stats.run();


    //---2. actual code---

    //assignment
    //Todo: Job Swapping not working: to many idlers
    jobManager.initMemory();
    jobEvents.run();                            // Detect new/removed sources, controller, haul targets, construction sites
    jobManager.releaseJobsOfDeadCreeps();
    jobManager.assignJobs();                    // Assign jobs to idle creeps


    //spawning
    //since miners were never build and jobManagement included job switching in case of emergencies: simplified the
    // role-differentiated minimum counts to a temporary single one
    //Todo: reproduce until idling creeps then, stop | might have issues with different bodyparts > wokers idling > but
    // being attacked shouldnt stop production
    let allRCount = 15;
    if (Object.keys(Game.creeps).length < allRCount) {
        //iter and set name to allrounder1-15 - better readability, but costs more though

        let allR = "AllRounder";
        let newName = allR + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, { memory: { type: allR } });
    }

    //labeling - spawns
    labelMgr.label_spawning('Spawn1');

    //all code base seperation
    //towerManager.run();
    constructionPlanner.run();

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