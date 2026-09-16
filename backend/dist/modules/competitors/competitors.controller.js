"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitorsController = void 0;
const db_1 = __importDefault(require("../../config/db"));
const CompetitorDiscoveryService_1 = require("./services/CompetitorDiscoveryService");
const zod_1 = require("zod");
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
    status: zod_1.z.enum(['ACTIVE', 'ARCHIVED']).optional()
});
class CompetitorsController {
    static async list(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { locationId, status } = req.query;
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
            query += ` ORDER BY c.distance_meters ASC`;
            const result = await db_1.default.query(query, values);
            return res.json({ data: result.rows });
        }
        catch (error) {
            console.error('List competitors error:', error);
            return res.status(500).json({ error: 'Failed to list competitors' });
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
                return res.status(400).json({ error: error.issues });
            }
            return res.status(400).json({ error: error.message || 'Failed to discover competitors' });
        }
    }
    static async track(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { competitorId } = req.params;
            const result = await db_1.default.query(`UPDATE competitors SET status = 'ACTIVE', updated_at = NOW()
         WHERE id = $1 AND organization_id = $2 RETURNING *`, [competitorId, organizationId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Competitor not found' });
            }
            return res.json({ data: result.rows[0] });
        }
        catch (error) {
            console.error('Track competitor error:', error);
            return res.status(500).json({ error: 'Failed to track competitor' });
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
                    // map camelCase to snake_case manually for these fields
                    const dbField = key === 'websiteUrl' ? 'website_url' : key;
                    setFields.push(`${dbField} = $${paramIdx++}`);
                    values.push(value);
                }
            }
            if (setFields.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
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
                return res.status(404).json({ error: 'Competitor not found' });
            }
            return res.json({ data: result.rows[0] });
        }
        catch (error) {
            console.error('Update competitor error:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues });
            }
            return res.status(500).json({ error: 'Failed to update competitor' });
        }
    }
    static async delete(req, res) {
        try {
            const organizationId = req.organizationMembership.organizationId;
            const { competitorId } = req.params;
            const result = await db_1.default.query(`UPDATE competitors SET status = 'ARCHIVED', updated_at = NOW()
         WHERE id = $1 AND organization_id = $2 RETURNING *`, [competitorId, organizationId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Competitor not found' });
            }
            return res.json({ data: { success: true } });
        }
        catch (error) {
            console.error('Delete competitor error:', error);
            return res.status(500).json({ error: 'Failed to archive competitor' });
        }
    }
}
exports.CompetitorsController = CompetitorsController;
