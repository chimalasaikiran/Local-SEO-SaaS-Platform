"use strict";
// Placeholder for BullMQ Ranking Queue (Step 5)
// import { Queue } from 'bullmq';
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingQueueName = void 0;
exports.rankingQueueName = 'keyword-ranking-queue';
/*
export const rankingQueue = new Queue(rankingQueueName, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});
*/
// Usage in Step 5:
// await rankingQueue.add('check-ranking', { keywordId, config });
