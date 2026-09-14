import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => {
  console.error('[Redis] Client Error', err);
});

export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('[Redis] Connection error:', error);
    return false;
  }
};

export default redisClient;
