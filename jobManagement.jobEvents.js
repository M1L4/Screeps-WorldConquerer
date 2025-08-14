const jobManager = require('jobManagement.jobManager');
const { JobTypes } = require('jobManagement.jobTypes');

const JobManagementJobEvents = {
    run() {
        jobManager.initMemory();

        const room = Game.spawns['Spawn1'].room;

        // ---- Construction Sites ----
        const currentSites = Object.keys(Game.constructionSites);
        const prevSites = Memory.tracked.constructionSites || [];

        for (const id of currentSites) {
            if (!prevSites.includes(id)) {
                jobManager.addJob(JobTypes.BUILD, id);
            }
        }

        for (const id of prevSites) {
            if (!currentSites.includes(id)) {
                jobManager.removeJob(id, JobTypes.BUILD);
            }
        }

        Memory.tracked.constructionSites = currentSites;

        // ---- Sources ----
        const currentSources = room.find(FIND_SOURCES).map(s => s.id);
        const prevSources = Memory.tracked.sources || [];

        for (const id of currentSources) {
            if (!prevSources.includes(id)) {
                jobManager.addJob(JobTypes.MINE, id);
            }
        }

        for (const id of prevSources) {
            if (!currentSources.includes(id)) {
                jobManager.removeJob(id, JobTypes.MINE);
            }
        }

        Memory.tracked.sources = currentSources;

        // ---- Controller ----
        const controllerId = room.controller ? room.controller.id : null;
        if (controllerId && Memory.tracked.controller !== controllerId) {
            jobManager.addJob(JobTypes.UPGRADE, controllerId);
            Memory.tracked.controller = controllerId;
        }
        if (!controllerId && Memory.tracked.controller) {
            jobManager.removeJob(Memory.tracked.controller, JobTypes.UPGRADE);
            Memory.tracked.controller = null;
        }

        // ---- Haul Targets ----
        const haulTargets = [];
        const trackedHaulTargets = Memory.tracked.haulTargets || [];

        for (const spawn of Object.values(Game.spawns)) {
            if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                haulTargets.push(spawn.id);
                if (!trackedHaulTargets.includes(spawn.id)) {
                    jobManager.addJob(JobTypes.HAUL, spawn.id, spawn.store.getFreeCapacity(RESOURCE_ENERGY));
                }
            }
        }

        for (const id of trackedHaulTargets) {
            if (!haulTargets.includes(id)) {
                jobManager.removeJob(id, JobTypes.HAUL);
            }
        }

        Memory.tracked.haulTargets = haulTargets;
    }
};

module.exports = JobManagementJobEvents;
