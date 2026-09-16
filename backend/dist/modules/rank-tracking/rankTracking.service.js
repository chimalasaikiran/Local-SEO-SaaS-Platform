"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankTrackingService = exports.rankTrackingQueue = void 0;
const db_1 = __importDefault(require("../../config/db"));
const geoGridService_1 = require("./services/geoGridService");
const providerRegistry_1 = require("./providers/providerRegistry");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const redisConnection = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
});
exports.rankTrackingQueue = new bullmq_1.Queue('rank-tracking-jobs', { connection: redisConnection });
class RankTrackingService {
    static async createConfig(organizationId, data) {
        const { businessId, locationId, name, searchEngine, countryCode, languageCode, device, gridSize, gridRadiusMeters, maxRank, frequency } = data;
        // Validations can be done at controller, assume sanitized here
        const result = await db_1.default.query(`INSERT INTO rank_tracking_configs (
        organization_id, business_id, location_id, name, search_engine, country_code, language_code, device, grid_size, grid_radius_meters, max_rank, frequency, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ACTIVE') RETURNING *`, [organizationId, businessId, locationId, name, searchEngine || 'GOOGLE', countryCode || 'IN', languageCode || 'en', device || 'DESKTOP', gridSize || 7, gridRadiusMeters || 5000, maxRank || 100, frequency || 'MANUAL']);
        return result.rows[0];
    }
    static async getConfigs(organizationId, filters = {}) {
        let query = `SELECT * FROM rank_tracking_configs WHERE organization_id = $1`;
        const params = [organizationId];
        let count = 2;
        if (filters.status) {
            query += ` AND status = $${count++}`;
            params.push(filters.status);
        }
        if (filters.businessId) {
            query += ` AND business_id = $${count++}`;
            params.push(filters.businessId);
        }
        query += ` ORDER BY created_at DESC`;
        const result = await db_1.default.query(query, params);
        return result.rows;
    }
    static async getConfigById(organizationId, configId) {
        const result = await db_1.default.query(`SELECT * FROM rank_tracking_configs WHERE id = $1 AND organization_id = $2`, [configId, organizationId]);
        return result.rows[0];
    }
    static async updateConfig(organizationId, configId, data) {
        // Only allow updating name, status, frequency. Grid settings changes should require grid regeneration logic explicitly.
        const fields = [];
        const params = [configId, organizationId];
        let count = 3;
        if (data.name) {
            fields.push(`name = $${count++}`);
            params.push(data.name);
        }
        if (data.status) {
            fields.push(`status = $${count++}`);
            params.push(data.status);
        }
        if (data.frequency) {
            fields.push(`frequency = $${count++}`);
            params.push(data.frequency);
        }
        if (fields.length === 0)
            return this.getConfigById(organizationId, configId);
        const query = `UPDATE rank_tracking_configs SET ${fields.join(', ')} WHERE id = $1 AND organization_id = $2 RETURNING *`;
        const result = await db_1.default.query(query, params);
        return result.rows[0];
    }
    static async archiveConfig(organizationId, configId) {
        return this.updateConfig(organizationId, configId, { status: 'ARCHIVED' });
    }
    static async getKeywords(organizationId, configId) {
        const result = await db_1.default.query(`SELECT k.* FROM keywords k
       JOIN rank_tracking_config_keywords rck ON k.id = rck.keyword_id
       WHERE rck.config_id = $1 AND rck.organization_id = $2`, [configId, organizationId]);
        return result.rows;
    }
    static async addKeyword(organizationId, configId, keywordId) {
        // Check if keyword belongs to organization
        const kwCheck = await db_1.default.query(`SELECT id FROM keywords WHERE id = $1 AND organization_id = $2`, [keywordId, organizationId]);
        if (kwCheck.rows.length === 0)
            throw new Error('Keyword not found or belongs to another organization');
        const result = await db_1.default.query(`INSERT INTO rank_tracking_config_keywords (organization_id, config_id, keyword_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *`, [organizationId, configId, keywordId]);
        return result.rows[0];
    }
    static async removeKeyword(organizationId, configId, keywordId) {
        await db_1.default.query(`DELETE FROM rank_tracking_config_keywords WHERE config_id = $1 AND keyword_id = $2 AND organization_id = $3`, [configId, keywordId, organizationId]);
        return true;
    }
    static async getGrid(organizationId, configId) {
        const result = await db_1.default.query(`SELECT * FROM rank_grid_points WHERE config_id = $1 AND organization_id = $2 ORDER BY row_index ASC, column_index ASC`, [configId, organizationId]);
        return result.rows;
    }
    static async regenerateGrid(organizationId, configId) {
        const config = await this.getConfigById(organizationId, configId);
        if (!config)
            throw new Error('Config not found');
        const loc = await db_1.default.query(`SELECT latitude, longitude FROM locations WHERE id = $1 AND organization_id = $2`, [config.location_id, organizationId]);
        if (loc.rows.length === 0)
            throw new Error('Location not found');
        const latitude = parseFloat(loc.rows[0].latitude);
        const longitude = parseFloat(loc.rows[0].longitude);
        const points = (0, geoGridService_1.generateGrid)({
            latitude,
            longitude,
            gridSize: config.grid_size,
            radiusMeters: config.grid_radius_meters
        });
        const client = await db_1.default.connect();
        try {
            await client.query('BEGIN');
            await client.query(`DELETE FROM rank_grid_points WHERE config_id = $1 AND organization_id = $2`, [configId, organizationId]);
            const values = [];
            const queryParts = [];
            let i = 1;
            for (const p of points) {
                queryParts.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
                values.push(organizationId, configId, p.latitude, p.longitude, p.rowIndex, p.columnIndex, p.distanceFromCenterMeters);
            }
            if (queryParts.length > 0) {
                await client.query(`INSERT INTO rank_grid_points (organization_id, config_id, latitude, longitude, row_index, column_index, distance_from_center_meters) VALUES ${queryParts.join(', ')}`, values);
            }
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
        return this.getGrid(organizationId, configId);
    }
    static async createRun(organizationId, configId) {
        // 1. Load config
        const config = await this.getConfigById(organizationId, configId);
        if (!config)
            throw new Error('Config not found');
        // 2. Validate provider
        const providerStatus = await providerRegistry_1.rankingProviderRegistry.getProviderStatus();
        if (providerStatus === providerRegistry_1.ProviderStatus.UNAVAILABLE || providerStatus === providerRegistry_1.ProviderStatus.ERROR) {
            // It's up to the product design if we allow queuing when unavailable, we will allow it and let worker fail or wait
        }
        // 3. Load keywords and grid
        const keywords = await this.getKeywords(organizationId, configId);
        const gridPoints = await this.getGrid(organizationId, configId);
        if (keywords.length === 0)
            throw new Error('No keywords assigned to config');
        if (gridPoints.length === 0)
            throw new Error('Grid points not generated');
        const totalJobs = keywords.length * gridPoints.length;
        const client = await db_1.default.connect();
        let runId;
        try {
            await client.query('BEGIN');
            const runResult = await client.query(`INSERT INTO rank_tracking_runs (organization_id, config_id, status, total_jobs) VALUES ($1, $2, 'QUEUED', $3) RETURNING id`, [organizationId, configId, totalJobs]);
            runId = runResult.rows[0].id;
            // Batch insert jobs
            const jobValues = [];
            const jobQueryParts = [];
            let i = 1;
            const bullMqJobs = [];
            for (const kw of keywords) {
                for (const gp of gridPoints) {
                    jobQueryParts.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, 'QUEUED')`);
                    jobValues.push(organizationId, runId, configId, kw.id, gp.id);
                }
            }
            await client.query(`INSERT INTO rank_tracking_jobs (organization_id, run_id, config_id, keyword_id, grid_point_id, status) VALUES ${jobQueryParts.join(', ')}`, jobValues);
            // Fetch created jobs to get their IDs
            const createdJobs = await client.query(`SELECT id, keyword_id, grid_point_id FROM rank_tracking_jobs WHERE run_id = $1`, [runId]);
            for (const job of createdJobs.rows) {
                bullMqJobs.push({
                    name: 'rankCheck',
                    data: {
                        organizationId,
                        runId,
                        configId,
                        jobId: job.id,
                        keywordId: job.keyword_id,
                        gridPointId: job.grid_point_id
                    },
                    opts: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 2000
                        },
                        timeout: 30000 // 30 seconds
                    }
                });
            }
            await exports.rankTrackingQueue.addBulk(bullMqJobs);
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
        return { runId, totalJobs };
    }
    static async getRun(organizationId, runId) {
        const result = await db_1.default.query(`SELECT * FROM rank_tracking_runs WHERE id = $1 AND organization_id = $2`, [runId, organizationId]);
        return result.rows[0];
    }
    static async getLatestRankings(organizationId, configId) {
        // Fetch latest run for this config
        const runResult = await db_1.default.query(`SELECT id FROM rank_tracking_runs WHERE config_id = $1 AND organization_id = $2 AND status = 'COMPLETED' ORDER BY created_at DESC LIMIT 1`, [configId, organizationId]);
        if (runResult.rows.length === 0)
            return [];
        const runId = runResult.rows[0].id;
        const rankings = await db_1.default.query(`SELECT kr.*, k.keyword as keyword_text, rgp.row_index, rgp.column_index 
                                       FROM keyword_rankings kr 
                                       JOIN keywords k ON kr.keyword_id = k.id
                                       JOIN rank_grid_points rgp ON kr.grid_point_id = rgp.id
                                       WHERE kr.run_id = $1 AND kr.organization_id = $2`, [runId, organizationId]);
        return rankings.rows;
    }
    static async getRunRankings(organizationId, runId) {
        const rankings = await db_1.default.query(`SELECT kr.*, k.keyword as keyword_text, rgp.row_index, rgp.column_index 
                                       FROM keyword_rankings kr 
                                       JOIN keywords k ON kr.keyword_id = k.id
                                       JOIN rank_grid_points rgp ON kr.grid_point_id = rgp.id
                                       WHERE kr.run_id = $1 AND kr.organization_id = $2`, [runId, organizationId]);
        return rankings.rows;
    }
    static async getRunsHistory(organizationId, configId) {
        const result = await db_1.default.query(`SELECT * FROM rank_tracking_runs 
       WHERE config_id = $1 AND organization_id = $2 
       ORDER BY created_at DESC`, [configId, organizationId]);
        return result.rows;
    }
}
exports.RankTrackingService = RankTrackingService;
