export const handleTestJob = async (data: any) => {
  console.log('[TestJob] Running with data:', data);
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('[TestJob] Finished simulated work');
  return { success: true, processedAt: new Date().toISOString() };
};
