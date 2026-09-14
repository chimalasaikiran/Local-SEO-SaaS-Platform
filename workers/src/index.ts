import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { handleTestJob } from './jobs/testJob';

dotenv.config();

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('[Worker Redis] Connection error:', err);
});

const worker = new Worker('local-seo-jobs', async (job) => {
  console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
  
  if (job.name === 'testJob') {
    return handleTestJob(job.data);
  }
  
  throw new Error(`Unknown job type: ${job.name}`);
}, { connection: redisConnection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

console.log('[Worker] Started successfully');
