import { Router } from 'express';
import { checkDbConnection } from '../config/db';
import { checkRedisConnection } from '../config/redis';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const dbStatus = await checkDbConnection();
  const redisStatus = await checkRedisConnection();

  const isHealthy = dbStatus && redisStatus;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus ? 'ok' : 'error',
      redis: redisStatus ? 'ok' : 'error'
    }
  });
});
