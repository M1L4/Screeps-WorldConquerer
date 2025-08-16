
/**
 * @file towerMgr.js
 * @description tutorial tower logic
 */


/**
 *
 * @param {int} towerId - The tower identifier
 */
module.exports.run = function (towerId) {
    var tower = Game.getObjectById(towerId);
    if (tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    }
};
