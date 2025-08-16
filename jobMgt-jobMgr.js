const JobMgtJobMgr = {
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
            j.targetId !== targetId || (type !== null && j.type !== type)
        );
    },

    assignJobs() {
        for (const creep of Object.values(Game.creeps)) {
            if (!creep.memory.job) {
                const job = Memory.jobs.find(j => !j.assignedTo);
                if (job) {
                    job.assignedTo = creep.name;
                    creep.memory.job = { type: job.type, targetId: job.targetId };
                }
            }
        }
    },

    releaseJobsOfDeadCreeps() {
        const aliveCreeps = Object.keys(Game.creeps);
        for (const job of Memory.jobs) {
            if (job.assignedTo && !aliveCreeps.includes(job.assignedTo)) {
                job.assignedTo = null;
            }
        }
    },

    getJobForCreep(creep) {
        if (!creep.memory.job) return null;
        return Memory.jobs.find(j => j.type === creep.memory.job.type && j.targetId === creep.memory.job.targetId) || null;
    }
};

module.exports = JobMgtJobMgr;
