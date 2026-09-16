"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const testJob_1 = require("./jobs/testJob");
const rankTrackingWorker_1 = require("./jobs/rankTrackingWorker");
const geoDiscoveryWorker_1 = require("./jobs/geoDiscoveryWorker");
const competitorWorker_1 = require("./jobs/competitorWorker");
const redisConnection = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
});
redisConnection.on('error', (err) => {
    console.error('[Worker Redis] Connection error:', err);
});
const worker = new bullmq_1.Worker('rank-tracking-jobs', async (job) => {
    console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'testJob') {
        return (0, testJob_1.handleTestJob)(job.data);
    }
    else if (job.name === 'rankCheck') {
        return (0, rankTrackingWorker_1.handleRankTrackingJob)(job.data);
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
const geoWorker = new bullmq_1.Worker('geo-jobs', async (job) => {
    console.log(`[GeoWorker] Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'discoverNearbyPlaces') {
        return (0, geoDiscoveryWorker_1.handleGeoDiscoveryJob)(job.data);
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
const competitorWorker = new bullmq_1.Worker('competitor-jobs', async (job) => {
    console.log(`[CompetitorWorker] Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'refreshCompetitor') {
        return (0, competitorWorker_1.handleCompetitorRefreshJob)(job.data);
    }
    throw new Error(`Unknown job type: ${job.name}`);
}, {
    connection: redisConnection,
    concurrency: 2
});
competitorWorker.on('failed', (job, err) => {
    console.error(`[CompetitorWorker] Job ${job?.id} failed:`, err);
});
console.log('[Worker] Started successfully');
