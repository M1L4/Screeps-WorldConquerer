const JobManagementJobManager = {
    initMemory() {
        if (!Memory.jobs) Memory.jobs = [];
        if (!Memory.tracked) {
            Memory.tracked = {
                constructionSites: [],
                sources: [],
                haulTargets: [],
                controller: null
            };
        }
    },

    addJob(type, targetId, amount = null) {
        if (!Memory.jobs.some(j => j.targetId === targetId && j.type === type)) {
            Memory.jobs.push({
                type,
                targetId,
                amount,
                assignedTo: null
            });
        }
    },

    removeJob(targetId, type = null) {
        Memory.jobs = Memory.jobs.filter(j =>
            j.targetId !== targetId || (type && j.type !== type)
        );
    },

    assignJobs() {
        for (const creep of Object.values(Game.creeps)) {
            if (!creep.memory.job) {
                const job = Memory.jobs.find(j => !j.assignedTo);
                if (job) {
                    job.assignedTo = creep.name;
                    creep.memory.job = job;
                }
            }
        }
    },

    getJobForCreep(creep) {
        return creep.memory.job;
    }
};

module.exports = JobManagementJobManager;