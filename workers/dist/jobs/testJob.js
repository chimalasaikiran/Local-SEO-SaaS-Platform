"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTestJob = void 0;
const handleTestJob = async (data) => {
    console.log('[TestJob] Running with data:', data);
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('[TestJob] Finished simulated work');
    return { success: true, processedAt: new Date().toISOString() };
};
exports.handleTestJob = handleTestJob;
