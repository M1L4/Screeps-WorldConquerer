// stats.js
const MAX_HISTORY = 100; // ticks to keep in rolling averages

module.exports = {
    run() {
        if (!Memory.stats) Memory.stats = {
            cpu: [],
            memSize: [],
            energyMined: [],
            mineralMined: [],
            creepRoles: {}
        };

        // --- CPU ---
        const cpuUsed = Game.cpu.getUsed();
        pushRolling(Memory.stats.cpu, cpuUsed);

        // --- Memory size ---
        const memSize = RawMemory.get().length;
        pushRolling(Memory.stats.memSize, memSize);

        // --- Mining ---
        let minedEnergy = 0;
        let minedMineral = 0;

        // --- Role counts reset each tick ---
        Memory.stats.creepRoles = {};

        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
            if (creep.spawning) continue;

            // count mined resources delivered this tick
            if (creep.store[RESOURCE_ENERGY]) {
                minedEnergy += creep.store[RESOURCE_ENERGY];
            }
            for (const res in creep.store) {
                if (res !== RESOURCE_ENERGY) minedMineral += creep.store[res];
            }

            // --- Role counts ---
            const role = creep.memory.role || "unknown";
            Memory.stats.creepRoles[role] = (Memory.stats.creepRoles[role] || 0) + 1;
        }

        pushRolling(Memory.stats.energyMined, minedEnergy);
        pushRolling(Memory.stats.mineralMined, minedMineral);


        // --- Optional: show every X ticks ---
        if (Game.time % 10=== 0) {
            console.log("---Tick: ", Game.time, "---");
            console.log("[Stats] CPU avg:", avg(Memory.stats.cpu).toFixed(2),
                " | Mem avg:", formatBytes(avg(Memory.stats.memSize).toFixed(0)),
                " | Energy avg:", avg(Memory.stats.energyMined).toFixed(1),
                " | Mineral avg:", avg(Memory.stats.mineralMined).toFixed(1));
                
                for (let r in Memory.stats.creepRoles) {
                console.log("  Role", r, ":", Memory.stats.creepRoles[r]);
                }
        }
    }
};

function pushRolling(arr, val) {
    arr.push(val);
    if (arr.length > MAX_HISTORY) arr.shift();
}

function avg(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function formatBytes(bytes) {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + " KB";
    } else {
        return bytes + " B";
    }
}