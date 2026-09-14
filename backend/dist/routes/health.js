"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const db_1 = require("../config/db");
const redis_1 = require("../config/redis");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get('/', async (req, res) => {
    const dbStatus = await (0, db_1.checkDbConnection)();
    const redisStatus = await (0, redis_1.checkRedisConnection)();
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
