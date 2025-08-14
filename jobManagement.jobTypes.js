/**
 * Enums - containing all creep roles.
 * @readonly
 * @enum {string}
 */
const JobTypes = Object.freeze({
    /** Mine resources */
    MINE: "mine",
    /** Build structures */
    BUILD: "build",
    /** Upgrade controller or other upgradable entities */
    UPGRADE: "upgrade",
    /** Transport resources between locations */
//    HAUL: "haul",
    /** Repair damaged structures */
//    REPAIR: "repair",
});

/**
 * A mapping from job type string → corresponding role module path.
 * Built dynamically from {@link JobTypes}.
 *
 * @type {Record<JobTypes[keyof typeof JobTypes], string>}
 */


const jobsMap = Object.values(JobTypes).reduce((map, jobName) => {
    const suffix = jobName.endsWith('e') ? 'r' : 'er';

    // Pfad muss exakt zum Modulnamen passen
    const moduleName = `jobManagement.role.${jobName.toLowerCase()}${suffix}`;

    console.log("-----" + suffix + ":    " + moduleName)

    map[jobName] = require(moduleName);

    return map;
}, {});

module.exports = { JobTypes, jobsMap };