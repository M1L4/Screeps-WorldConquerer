/**
 * @file monitoring-stats.js
 * @description Collects and prints rolling statistics about CPU usage, memory size, mining output,
 * creep role counts, and controller level progress per room.
 */

const DEFAULT_MAX_HISTORY = 100; // default ticks to keep in rolling averages
const DEFAULT_PRINT_INTERVAL = 25; //in ticks

const monCreeps = require('monitoring-creeps');
const monJobs   = require('monitoring-jobs');

/**
 * Pushes a value into an array and keeps the array length <= max history.
 * @param {number[]} arr - The array to push into.
 * @param {number} val - The value to push.
 * @param {number} maxHistory - Maximum number of entries to keep.
 */
function pushRolling(arr, val, maxHistory) {
    arr.push(val);
    if (arr.length > maxHistory) arr.shift();
}

/**
 * Calculates the average of all numbers in an array.
 * @param {number[]} arr - Array of numeric values.
 * @param {number} [decimals=2] - Number of decimal places to round to.
 * @returns {number} The average value, rounded to the given decimal places.
 */
function avg(arr, decimals = 2) {
    if (!arr || arr.length === 0) return 0;

    let sum = 0;
    for (let i = 0, len = arr.length; i < len; i++) {
        sum += arr[i];
    }

    const average = sum / arr.length;
    const factor = Math.pow(10, decimals);
    return Math.round(average * factor) / factor;
}


/**
 * Converts a number of bytes into a readable string with appropriate units.
 * Used for memory
 *
 * @param {number} bytes - The size in bytes to format.
 * @param {number} [decimals=2] - Number of decimal places to include in the formatted string.
 * @returns {string} - A string representation of the size in appropriate units (Bytes, KB, MB). Memory hardcapped at 2MB
 *
 * @example
 * formatBytes(1024); // "1.00 KB"
 */
function formatBytes(bytes) {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + " KB";
    } else {
        return bytes.toFixed(2) + " B";
    }
}


module.exports = {
    /**
     * Main stats tracking function. Tracks CPU, memory, mined resources, creep role counts,
     * and controller level progression per room.
     * @param {number} [maxHistory=DEFAULT_MAX_HISTORY] - Optional override for max history length.
     */
    run(maxHistory = DEFAULT_MAX_HISTORY, printInterval = DEFAULT_PRINT_INTERVAL) {
        if (!Memory.stats) Memory.stats = {};
        if (!Memory.stats.cpu) Memory.stats.cpu = [];
        if (!Memory.stats.memSize) Memory.stats.memSize = [];
        if (!Memory.stats.energyMined) Memory.stats.energyMined = [];
        if (!Memory.stats.mineralMined) Memory.stats.mineralMined = [];
        if (!Memory.stats.creepJob) Memory.stats.creepJob = {};
        if (!Memory.stats.rooms) Memory.stats.rooms = {};

        // --- CPU ---
        const cpuUsed = Game.cpu.getUsed();
        pushRolling(Memory.stats.cpu, cpuUsed, maxHistory);

        // --- Memory size ---
        const memSizeBytes = RawMemory.get().length;
        pushRolling(Memory.stats.memSize, memSizeBytes, maxHistory);

        // --- Mining ---
        let minedEnergy = 0;
        let minedMineral = 0;
        Memory.stats.creepJobs = {}; // reset role counts for this tick

        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
            if (creep.spawning) continue;

            if (creep.store[RESOURCE_ENERGY]) {
                minedEnergy += creep.store[RESOURCE_ENERGY];
            }
            for (const res in creep.store) {
                if (res !== RESOURCE_ENERGY) minedMineral += creep.store[res];
            }

            const job = creep.memory.job || "unknown";
            Memory.stats.creepJobs[job] =
                ((Memory.stats.creepJobs[job] || 0) + 1);
        }

        pushRolling(Memory.stats.energyMined, minedEnergy, maxHistory);
        pushRolling(Memory.stats.mineralMined, minedMineral, maxHistory);

        // --- Room-based stats ---
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            if (!room.controller || !room.controller.my) continue;

            if (!Memory.stats.rooms[roomName]) {
                Memory.stats.rooms[roomName] = {
                    controllerLevel: room.controller.level,
                    levelTimes: {}
                };
            }

            const roomStats = Memory.stats.rooms[roomName];

            // If level increased, store time taken to reach it
            if (room.controller.level > (roomStats.controllerLevel || 0)) {
                roomStats.controllerLevel = room.controller.level;
                roomStats.levelTimes[room.controller.level] = Game.time;
            }
        }

        // --- Print every X ticks ---
        if (Game.time % printInterval === 0) {
            console.log(`[Stats] over last ${maxHistory} ticks | GameTime: ${Game.time}`);
            console.log(
                "  CPU avg:", avg(Memory.stats.cpu).toFixed(2),
                "/", Game.cpu.limit,
                "| Mem avg:", (formatBytes(avg(Memory.stats.memSize) / 1024)),
                "| Energy avg:", avg(Memory.stats.energyMined).toFixed(1),
                "| Mineral avg:", avg(Memory.stats.mineralMined).toFixed(1)
            );

            // Per-room creep composition (replaces Memory.stats.creepJobs printout)
            monCreeps.printCompositionByRoom();

            // Jobs summary (count by type + open)
            monJobs.printJobSummary();


            for (const roomName in Memory.stats.rooms) {
                const rStats = Memory.stats.rooms[roomName];
                console.log(`  Room ${roomName} - Controller Lvl: ${rStats.controllerLevel}`);
                for (const lvl in rStats.levelTimes) {
                    console.log(`    Level ${lvl} reached at tick ${rStats.levelTimes[lvl]}`);
                }
            }
        }
    }
};