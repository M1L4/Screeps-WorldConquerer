
/**
 * @file role.builder.js
 * @description Executes build jobs by retrieving energy from nearest supplier.
 */

const energySupplier = require('logistics-energySupplier');

/**
 * Runs the builder role logic for the given creep.
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

    if (creep.store[RESOURCE_ENERGY] === 0) {
        energySupplier.getEnergy(creep);
        return;
    }

    if (creep.build(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    }
};
