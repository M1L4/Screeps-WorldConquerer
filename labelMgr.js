/**
 * @file labelMgr.js
 * @description first implementation for labeling jobs
 */

/**
 *
 * @param {String} spawnId - The spawn identifier to be labeled when spawning.
 */

module.exports.label_spawning = function (spawnID) {
    //labeling: creep spawn
    if (Game.spawns[spawnID].spawning) {
        var spawningCreep = Game.creeps[Game.spawns[spawnID].spawning.name];
        console.log('New spawn: ' + spawningCreep.name);

        Game.spawns[spawnID].room.visual.text(
            '🛠️' + spawningCreep.memory.type,
            Game.spawns[spawnID].pos.x + 1,
            Game.spawns[spawnID].pos.y,
            {align: 'left', opacity: 0.8});
    }
};