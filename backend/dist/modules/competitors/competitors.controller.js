"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitorsController = void 0;
const db_1 = __importDefault(require("../../config/db"));
const CompetitorDiscoveryService_1 = require("./services/CompetitorDiscoveryService");
const zod_1 = require("zod");
const bullmq_1 = require("bullmq");
const discoveryService = new CompetitorDiscoveryService_1.CompetitorDiscoveryService();
const DiscoverSchema = zod_1.z.object({
    businessId: zod_1.z.string().uuid(),
    locationId: zod_1.z.string().uuid(),
    category: zod_1.z.string().min(2),
    radiusMeters: zod_1.z.coerce.number().min(100).max(50000).default(5000),
    limit: zod_1.z.coerce.number().min(1).max(500).default(100)
});
const UpdateCompetitorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    category: zod_1.z.string().optional(),
    websiteUrl: zod_1.z.string().url().or(zod_1.z.literal('')).nullable().optional(),
    phone: zod_1.z.string().or(zod_1.z.literal('')).nullable().optional(),
    status: zod_1.z.enum(['ACTIVE', 'ARCHIVED']).optional(),
    trackingStatus: zod_1.z.enum(['TRACKED', 'UNTRACKED', 'ARCHIVED']).optional(),
    notes: zod_1.z.string().nullable().optional()
});
let competitorQueue = null;
const getCompetitorQueue = () => {
    if (!competitorQueue) {
        competitorQueue = new bullmq_1.Queue('competitor-jobs', {
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10)
            }
        });
    }
    return competitorQueue;
};
class CompetitorsController {
    static async list(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { locationId, status, trackingStatus } = req.query;
            let query = `
        SELECT c.*, g.last_synced_at 
        FROM competitors c
        LEFT JOIN geo_places g ON c.geo_place_id = g.id
        WHERE c.organization_id = $1
      `;
            const values = [organizationId];
            let paramIdx = 2;
            if (locationId) {
                query += ` AND c.location_id = $${paramIdx++}`;
                values.push(locationId);
            }
            if (status) {
                query += ` AND c.status = $${paramIdx++}`;
                values.push(status);
            }
            else {
                query += ` AND c.status != 'ARCHIVED'`;
            }
            if (trackingStatus) {
                query += ` AND c.tracking_status = $${paramIdx++}`;
                values.push(trackingStatus);
            }
            else {
                query += ` AND c.tracking_status != 'ARCHIVED'`;
            }
            query += ` ORDER BY c.distance_meters ASC`;
            const result = await db_1.default.query(query, values);
            return res.json({ data: result.rows });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list competitors' } });
        }
    }
    static async getDetail(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { competitorId } = req.params;
            const result = await db_1.default.query(`SELECT c.*, g.last_synced_at, g.address_line_1, g.address_line_2, g.city, g.state, g.postal_code, g.country,
         g.metadata as geo_metadata
         FROM competitors c
         LEFT JOIN geo_places g ON c.geo_place_id = g.id
         WHERE c.id = $1 AND c.organization_id = $2`, [competitorId, organizationId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
            }
            return res.json({ data: result.rows[0] });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch competitor details' } });
        }
    }
    static async discover(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const payload = DiscoverSchema.parse(req.body);
            const result = await discoveryService.discover({
                organizationId,
                ...payload
            });
            return res.json({ data: result });
        }
        catch (error) {
            console.error('Discover competitors error:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
            }
            return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: error.message || 'Failed to discover competitors' } });
        }
    }
    static async track(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { competitorId } = req.params;
            const result = await db_1.default.query(`UPDATE competitors SET tracking_status = 'TRACKED', status = 'ACTIVE', updated_at = NOW()
         WHERE id = $1 AND organization_id = $2 RETURNING *`, [competitorId, organizationId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
            }
            return res.json({ data: result.rows[0] });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to track competitor' } });
        }
    }
    static async untrack(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { competitorId } = req.params;
            const result = await db_1.default.query(`UPDATE competitors SET tracking_status = 'UNTRACKED', updated_at = NOW()
         WHERE id = $1 AND organization_id = $2 RETURNING *`, [competitorId, organizationId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
            }
            return res.json({ data: result.rows[0] });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to untrack competitor' } });
        }
    }
    static async update(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { competitorId } = req.params;
            const payload = UpdateCompetitorSchema.parse(req.body);
            const setFields = [];
            const values = [];
            let paramIdx = 1;
            for (const [key, value] of Object.entries(payload)) {
                if (value !== undefined) {
                    const dbField = key === 'websiteUrl' ? 'website_url' : key === 'trackingStatus' ? 'tracking_status' : key;
                    setFields.push(`${dbField} = $${paramIdx++}`);
                    values.push(value);
                }
            }
            if (setFields.length === 0) {
                return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'No fields to update' } });
            }
            setFields.push(`updated_at = NOW()`);
            values.push(competitorId);
            values.push(organizationId);
            const query = `
        UPDATE competitors 
        SET ${setFields.join(', ')}
        WHERE id = $${paramIdx++} AND organization_id = $${paramIdx++}
        RETURNING *
      `;
            const result = await db_1.default.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
            }
            return res.json({ data: result.rows[0] });
        }
        catch (error) {
            console.error('Update competitor error:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
            }
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update competitor' } });
        }
    }
    static async delete(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { competitorId } = req.params;
            const result = await db_1.default.query(`UPDATE competitors SET tracking_status = 'ARCHIVED', status = 'ARCHIVED', updated_at = NOW()
         WHERE id = $1 AND organization_id = $2 RETURNING *`, [competitorId, organizationId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
            }
            return res.json({ data: { success: true } });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to archive competitor' } });
        }
    }
    static async history(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { competitorId } = req.params;
            const result = await db_1.default.query(`SELECT * FROM competitor_snapshots 
         WHERE competitor_id = $1 AND organization_id = $2
         ORDER BY captured_at DESC`, [competitorId, organizationId]);
            return res.json({ data: result.rows });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch competitor history' } });
        }
    }
    static async compare(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { businessId, locationId, competitorIds } = req.query;
            if (!businessId || !locationId || !competitorIds) {
                return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing required parameters' } });
            }
            const compIds = competitorIds.split(',').slice(0, 3); // Max 3 competitors
            const businessResult = await db_1.default.query(`SELECT b.name, b.primary_category, b.website_url, b.phone, 
                l.latitude, l.longitude
         FROM businesses b
         JOIN locations l ON l.business_id = b.id
         WHERE b.id = $1 AND l.id = $2 AND b.organization_id = $3`, [businessId, locationId, organizationId]);
            if (businessResult.rows.length === 0) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Business/Location not found' } });
            }
            const businessData = businessResult.rows[0];
            const placeholders = compIds.map((_, i) => `$${i + 3}`).join(', ');
            const compResult = await db_1.default.query(`SELECT id, name, category, website_url, phone, distance_meters, source
         FROM competitors
         WHERE id IN (${placeholders}) AND organization_id = $1 AND business_id = $2`, [organizationId, businessId, ...compIds]);
            return res.json({
                data: {
                    business: businessData,
                    competitors: compResult.rows
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch comparison' } });
        }
    }
    static async refresh(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { competitorId } = req.params;
            const result = await db_1.default.query(`SELECT id, location_id FROM competitors WHERE id = $1 AND organization_id = $2`, [competitorId, organizationId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
            }
            const competitor = result.rows[0];
            const queue = getCompetitorQueue();
            await queue.add('refreshCompetitor', {
                organizationId,
                competitorId,
                locationId: competitor.location_id
            });
            return res.json({ data: { success: true, message: 'Refresh job queued' } });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to queue refresh job' } });
        }
    }
}
exports.CompetitorsController = CompetitorsController;
