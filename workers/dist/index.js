"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
const testJob_1 = require("./jobs/testJob");
dotenv_1.default.config();
const redisConnection = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
});
redisConnection.on('error', (err) => {
    console.error('[Worker Redis] Connection error:', err);
});
const worker = new bullmq_1.Worker('local-seo-jobs', async (job) => {
    console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'testJob') {
        return (0, testJob_1.handleTestJob)(job.data);
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
