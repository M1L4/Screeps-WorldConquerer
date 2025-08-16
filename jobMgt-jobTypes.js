/**
 * Enums - containing all creep roles.
 * @readonly
 * @enum {string}: action {name of the 'class-role'}
 * @example class-role = miner - action "Mine": name "miner" - logic at file: jobMgt.role.miner
 */
const JobTypes = Object.freeze({
    /** Mine resources */
    MINE: "miner",
    /** Build structures */
    BUILD: "builder",
    /** Upgrade controller or other upgradable entities */
    UPGRADE: "upgrader",
    /** Transport resources between locations */
    HAUL: "hauler",
    /** Repair damaged structures */
//    REPAIR: "repair",
});

/**
 * A mapping from job type string → corresponding role module path.
 * Built dynamically from {@link JobTypes}.
 *
 * @todo build only once
 *
 * @type {Record<JobTypes[keyof typeof JobTypes], string>}
 */


/*
// Create jobsMap only once
let jobsMap = null;
function getJobsMap() {
    if (jobsMap) return jobsMap; // return cached map if already built

    jobsMap = {};
    for (const jobName of Object.values(JobTypes)) {
        const moduleName = `jobManagement.role.${jobName.toLowerCase()}`;
        console.log("-----:    " + moduleName);
        jobsMap[jobName] = require(moduleName);
    }
    return jobsMap;
}

module.exports = { JobTypes, jobsMap: getJobsMap() };*/

/*
// Use a global cache key to survive multiple requires within the same global.
if (!global.__JOBS_MAP__) {
    const m = {};
    const roleModules = {
        [JobTypes.MINE]:    'jobManagement.role.miner',
        [JobTypes.BUILD]:   'jobManagement.role.builder',
        [JobTypes.UPGRADE]: 'jobManagement.role.upgrader',
        [JobTypes.HAUL]:    'jobManagement.role.hauler',
    };

    for (const [type, path] of Object.entries(roleModules)) {
        console.log("-----:    " + path);
        m[type] = require(path);
    }
    global.__JOBS_MAP__ = m;
}

const jobsMap = global.__JOBS_MAP__;

module.exports = { JobTypes, jobsMap };
*/

const jobsMap = {};
for (const jobName of Object.values(JobTypes)) {
    // Path must exactly match the module name
    const moduleName = `jobMgt-role-${jobName.toLowerCase()}`;

    console.log("-----:    " + moduleName);

    jobsMap[jobName] = require(moduleName);
}

module.exports = { JobTypes, jobsMap };