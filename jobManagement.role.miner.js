
/**
 * @file role.miner.js
 * @description Executes mine jobs: harvests from assigned source.
 */

/**
 * Runs the miner role logic for the given creep.
 * @param {Creep} creep - The creep executing this role.
 */
module.exports.run = function (creep) {
    if (!creep.memory.job) return;

    const target = Game.getObjectById(creep.memory.job.targetId);
    if (!target) {
        creep.say('❌ target');
        delete creep.memory.job;
        return;
    }

    if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
};
