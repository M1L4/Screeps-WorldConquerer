
/**
 * @file jobManagement.energySupplier.js
 * @description Provides helper functions for retrieving energy from the best available source.
 */

/**
 * Retrieves energy for the given creep from the nearest available source in priority order:
 * 1) Dropped energy
 * 2) Containers or Storage
 * 3) Spawns or Extensions
 * 4) Active energy sources
 *
 * @param {Creep} creep - The creep that needs energy.
 */
module.exports.getEnergy = function (creep) {
    // 1) Dropped energy
    const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 0
    });
    if (dropped) {
        if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
            creep.moveTo(dropped, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return;
    }

    // 2) Containers or Storage
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: s =>
            (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
            s.store[RESOURCE_ENERGY] > 0
    });
    if (containers.length > 0) {
        const container = creep.pos.findClosestByPath(containers);
        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return;
    }

    // 3) Spawns or Extensions
    const spawnsAndExtensions = creep.room.find(FIND_STRUCTURES, {
        filter: s =>
            (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
            s.store[RESOURCE_ENERGY] > 0
    });
    if (spawnsAndExtensions.length > 0) {
        const se = creep.pos.findClosestByPath(spawnsAndExtensions);
        if (creep.withdraw(se, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(se, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return;
    }

    // 4) Active sources
    const activeSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (activeSource) {
        if (creep.harvest(activeSource) === ERR_NOT_IN_RANGE) {
            creep.moveTo(activeSource, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    } else {
        creep.say('⚠️ no energy');
    }
};
