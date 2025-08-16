
/**
 * @file buildMgr.js
 * @description some simple building jobs for now
 */


function buildRoadBetween(pos1, pos2) {
    var path = pos1.findPathTo(pos2, {ignoreCreeps: true});
    for (let step of path) {
        Game.rooms[pos1.roomName].createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
    }
}


/**
 *
 * @param {String} spawnId - The spawn identifier of the room to be planned/build
 */
module.exports.run = function (spawnID) {
    //construction
    var spawn = Game.spawns['Spawn1']
    var room = spawn.room;
    var controllerPos = room.controller.pos;
    var source = controllerPos.findClosestByRange(FIND_SOURCES_ACTIVE);

    if (source) {
        //controller - closest source
        buildRoadBetween(controllerPos, source.pos);
        //controller - spawn
        buildRoadBetween(controllerPos, spawn.pos);

        //spawn - 2sources
        for (let s in room.find(FIND_SOURCES)) {
            buildRoadBetween(spawn.pos, s.pos);
        }

    }

};
