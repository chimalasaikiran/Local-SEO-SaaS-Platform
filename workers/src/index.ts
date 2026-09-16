import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { handleTestJob } from './jobs/testJob';
import { handleRankTrackingJob } from './jobs/rankTrackingWorker';
import { handleGeoDiscoveryJob } from './jobs/geoDiscoveryWorker';
import { handleCompetitorRefreshJob } from './jobs/competitorWorker';
import { handleAuditJob } from './jobs/auditWorker';

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('[Worker Redis] Connection error:', err);
});

const worker = new Worker('rank-tracking-jobs', async (job) => {
  console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
  
  if (job.name === 'testJob') {
    return handleTestJob(job.data);
  } else if (job.name === 'rankCheck') {
    return handleRankTrackingJob(job.data);
  }
  
  throw new Error(`Unknown job type: ${job.name}`);
}, { 
  connection: redisConnection, 
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10) 
});

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

// Geo Jobs Worker
const geoWorker = new Worker('geo-jobs', async (job) => {
  console.log(`[GeoWorker] Processing job ${job.id} of type ${job.name}`);
  
  if (job.name === 'discoverNearbyPlaces') {
    return handleGeoDiscoveryJob(job.data);
  }
  
  throw new Error(`Unknown job type: ${job.name}`);
}, { 
  connection: redisConnection, 
  concurrency: 2 // Geo jobs might be heavy, lower concurrency
});

geoWorker.on('failed', (job, err) => {
  console.error(`[GeoWorker] Job ${job?.id} failed:`, err);
});

// Competitor Jobs Worker
const competitorWorker = new Worker('competitor-jobs', async (job) => {
  console.log(`[CompetitorWorker] Processing job ${job.id} of type ${job.name}`);
  
  if (job.name === 'refreshCompetitor') {
    return handleCompetitorRefreshJob(job.data);
  }
  
  throw new Error(`Unknown job type: ${job.name}`);
}, { 
  connection: redisConnection, 
  concurrency: 2 
});

competitorWorker.on('failed', (job, err) => {
  console.error(`[CompetitorWorker] Job ${job?.id} failed:`, err);
});

// Audit Jobs Worker
const auditWorker = new Worker('seo-audit-jobs', async (job) => {
  console.log(`[AuditWorker] Processing job ${job.id} of type ${job.name}`);
  
  if (job.name === 'runAudit') {
    return handleAuditJob(job);
  }
  
  throw new Error(`Unknown job type: ${job.name}`);
}, { 
  connection: redisConnection, 
  concurrency: parseInt(process.env.AUDIT_WORKER_CONCURRENCY || '2', 10) 
});

auditWorker.on('failed', (job, err) => {
  console.error(`[AuditWorker] Job ${job?.id} failed:`, err);
});

console.log('[Worker] Started successfully');
