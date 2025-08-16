/**
 * @file monitoring-creeps.js
 * @description Prints creep composition per room grouped by current job type.
 *              Replaces the generic Memory.stats.creepJobs console output.
 */

/**
 * Prints, for each owned room, the number of creeps per job type.
 * Job type is taken from creep.memory.job.type; missing job => "idle".
 */
module.exports.printCompositionByRoom = function () {
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        if (!room.controller || !room.controller.my) continue;

        const creeps = room.find(FIND_MY_CREEPS);
        const counts = Object.create(null);

        for (const c of creeps) {
            const role = (c.memory && c.memory.job && c.memory.job.type) ? c.memory.job.type : 'idle';
            counts[role] = (counts[role] || 0) + 1;
        }

        const parts = Object.keys(counts).sort().map(k => `${k}:${counts[k]}`);
        console.log(`  [Creeps] ${roomName} total:${creeps.length} | ${parts.join(' | ')}`);
    }
};
