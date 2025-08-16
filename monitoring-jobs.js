/**
 * @file monitoring-jobs.js
 * @description Prints summary of all jobs in Memory.jobs by type and assignment state.
 * Requires the job manager to maintain Memory.jobs entries with fields:
 *   { type, targetId, amount, assignedTo }  // see job manager:contentReference[oaicite:2]{index=2}
 */

module.exports.printJobSummary = function () {
    const jobs = Memory.jobs || [];
    const byType = Object.create(null);
    const openByType = Object.create(null);

    for (const j of jobs) {
        byType[j.type] = (byType[j.type] || 0) + 1;
        if (!j.assignedTo) openByType[j.type] = (openByType[j.type] || 0) + 1;
    }

    const types = Object.keys(byType).sort();
    const parts = types.map(t => `${t}:${byType[t]} (${openByType[t] || 0} open)`);
    console.log(`[Jobs] total:${jobs.length} | ${parts.join(' | ')}`);
};
