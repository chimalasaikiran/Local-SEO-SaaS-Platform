"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
class KeywordRepository {
    static async list(organizationId, query) {
        const { page, limit, search, status, businessId, locationId, searchEngine, device } = query;
        const offset = (page - 1) * limit;
        const conditions = ['k.organization_id = $1'];
        const values = [organizationId];
        let paramIndex = 2;
        if (businessId) {
            conditions.push(`k.business_id = $${paramIndex}`);
            values.push(businessId);
            paramIndex++;
        }
        if (locationId) {
            conditions.push(`k.location_id = $${paramIndex}`);
            values.push(locationId);
            paramIndex++;
        }
        if (status) {
            conditions.push(`k.status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
        }
        else {
            // By default exclude archived
            conditions.push(`k.status != $${paramIndex}`);
            values.push('ARCHIVED');
            paramIndex++;
        }
        if (searchEngine) {
            conditions.push(`k.search_engine = $${paramIndex}`);
            values.push(searchEngine);
            paramIndex++;
        }
        if (device) {
            conditions.push(`k.device = $${paramIndex}`);
            values.push(device);
            paramIndex++;
        }
        if (search) {
            conditions.push(`k.keyword ILIKE $${paramIndex}`);
            values.push(`%${search}%`);
            paramIndex++;
        }
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM keywords k ${whereClause}`, values);
        const total = parseInt(countResult.rows[0].count, 10);
        const dataQuery = `
      SELECT 
        k.*,
        b.name as business_name,
        l.name as location_name
      FROM keywords k
      LEFT JOIN businesses b ON k.business_id = b.id
      LEFT JOIN locations l ON k.location_id = l.id
      ${whereClause}
      ORDER BY k.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        const dataResult = await db_1.default.query(dataQuery, [...values, limit, offset]);
        const data = dataResult.rows.map(row => {
            const keyword = { ...row };
            delete keyword.business_name;
            delete keyword.location_name;
            return {
                ...keyword,
                business: { id: keyword.business_id, name: row.business_name },
                location: { id: keyword.location_id, name: row.location_name },
                currentRanking: null, // Placeholder for step 5
                previousRanking: null, // Placeholder for step 5
                rankingChange: null, // Placeholder for step 5
                lastCheckedAt: null // Placeholder for step 5
            };
        });
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    static async findById(organizationId, keywordId) {
        const result = await db_1.default.query(`SELECT * FROM keywords WHERE id = $1 AND organization_id = $2`, [keywordId, organizationId]);
        return result.rows[0] || null;
    }
    static async create(organizationId, payload) {
        const result = await db_1.default.query(`INSERT INTO keywords (
        organization_id, business_id, location_id, keyword, normalized_keyword,
        search_engine, country_code, language_code, device
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [
            organizationId,
            payload.businessId,
            payload.locationId,
            payload.keyword,
            payload.normalizedKeyword,
            payload.searchEngine,
            payload.countryCode,
            payload.languageCode,
            payload.device
        ]);
        return result.rows[0];
    }
    static async update(organizationId, keywordId, payload) {
        const setFields = [];
        const values = [];
        let paramIndex = 1;
        const mappings = {
            keyword: 'keyword',
            normalizedKeyword: 'normalized_keyword',
            searchEngine: 'search_engine',
            countryCode: 'country_code',
            languageCode: 'language_code',
            device: 'device',
            status: 'status'
        };
        for (const [key, dbField] of Object.entries(mappings)) {
            if (payload[key] !== undefined) {
                setFields.push(`${dbField} = $${paramIndex++}`);
                values.push(payload[key]);
            }
        }
        if (setFields.length === 0) {
            return this.findById(organizationId, keywordId);
        }
        values.push(keywordId);
        values.push(organizationId);
        const query = `
      UPDATE keywords
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex++} AND organization_id = $${paramIndex++}
      RETURNING *
    `;
        const result = await db_1.default.query(query, values);
        return result.rows[0] || null;
    }
    // --- Keyword Locations ---
    static async listLocations(organizationId, keywordId) {
        const result = await db_1.default.query(`SELECT * FROM keyword_locations WHERE keyword_id = $1 AND organization_id = $2 ORDER BY created_at ASC`, [keywordId, organizationId]);
        return result.rows;
    }
    static async addLocation(organizationId, keywordId, payload) {
        const result = await db_1.default.query(`INSERT INTO keyword_locations (organization_id, keyword_id, latitude, longitude, radius_meters, label)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [organizationId, keywordId, payload.latitude, payload.longitude, payload.radiusMeters || null, payload.label || null]);
        return result.rows[0];
    }
    static async removeLocation(organizationId, keywordId, locationId) {
        const result = await db_1.default.query(`DELETE FROM keyword_locations WHERE id = $1 AND keyword_id = $2 AND organization_id = $3`, [locationId, keywordId, organizationId]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.KeywordRepository = KeywordRepository;
