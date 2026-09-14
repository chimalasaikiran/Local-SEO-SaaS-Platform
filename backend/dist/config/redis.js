"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRedisConnection = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisClient = (0, redis_1.createClient)({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});
redisClient.on('error', (err) => {
    console.error('[Redis] Client Error', err);
});
const checkRedisConnection = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        await redisClient.ping();
        return true;
    }
    catch (error) {
        console.error('[Redis] Connection error:', error);
        return false;
    }
};
exports.checkRedisConnection = checkRedisConnection;
exports.default = redisClient;
