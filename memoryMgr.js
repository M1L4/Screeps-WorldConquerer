
/**
 * @file memoryMgr.js
 * @description early implementation of a memory manager, hanlding cleanups etc
 */

module.exports.cleanUp = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
};
