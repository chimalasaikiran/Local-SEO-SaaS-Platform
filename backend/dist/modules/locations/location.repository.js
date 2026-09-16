"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
class LocationRepository {
    static async list(organizationId, query) {
        const { page, limit, search, status, businessId } = query;
        const offset = (page - 1) * limit;
        const conditions = ['organization_id = $1'];
        const values = [organizationId];
        let paramIndex = 2;
        if (businessId) {
            conditions.push(`business_id = $${paramIndex}`);
            values.push(businessId);
            paramIndex++;
        }
        if (status) {
            conditions.push(`status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
        }
        else {
            conditions.push(`status = $${paramIndex}`);
            values.push('ACTIVE');
            paramIndex++;
        }
        if (search) {
            conditions.push(`(name ILIKE $${paramIndex} OR city ILIKE $${paramIndex} OR state ILIKE $${paramIndex} OR country ILIKE $${paramIndex})`);
            values.push(`%${search}%`);
            paramIndex++;
        }
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM locations ${whereClause}`, values);
        const total = parseInt(countResult.rows[0].count, 10);
        const dataQuery = `
      SELECT *
      FROM locations
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        const dataResult = await db_1.default.query(dataQuery, [...values, limit, offset]);
        return {
            data: dataResult.rows,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    static async findById(organizationId, locationId) {
        const result = await db_1.default.query(`SELECT * FROM locations WHERE id = $1 AND organization_id = $2`, [locationId, organizationId]);
        return result.rows[0] || null;
    }
    static async create(organizationId, businessId, payload) {
        const result = await db_1.default.query(`INSERT INTO locations (
        organization_id, business_id, name, address_line_1, address_line_2, 
        city, state, postal_code, country, latitude, longitude, timezone, phone, website_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`, [
            organizationId,
            businessId,
            payload.name,
            payload.addressLine1,
            payload.addressLine2 || null,
            payload.city,
            payload.state || null,
            payload.postalCode || null,
            payload.country,
            payload.latitude ?? null,
            payload.longitude ?? null,
            payload.timezone || null,
            payload.phone || null,
            payload.websiteUrl || null
        ]);
        return result.rows[0];
    }
    static async update(organizationId, locationId, payload) {
        const setFields = [];
        const values = [];
        let paramIndex = 1;
        const mappings = {
            name: 'name',
            addressLine1: 'address_line_1',
            addressLine2: 'address_line_2',
            city: 'city',
            state: 'state',
            postalCode: 'postal_code',
            country: 'country',
            latitude: 'latitude',
            longitude: 'longitude',
            timezone: 'timezone',
            phone: 'phone',
            websiteUrl: 'website_url',
            status: 'status'
        };
        for (const [key, dbField] of Object.entries(mappings)) {
            if (payload[key] !== undefined) {
                setFields.push(`${dbField} = $${paramIndex++}`);
                const val = payload[key];
                values.push(val === '' ? null : val ?? null);
            }
        }
        if (setFields.length === 0) {
            return this.findById(organizationId, locationId);
        }
        setFields.push(`updated_at = NOW()`);
        values.push(locationId);
        values.push(organizationId);
        const query = `
      UPDATE locations
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex++} AND organization_id = $${paramIndex++}
      RETURNING *
    `;
        const result = await db_1.default.query(query, values);
        return result.rows[0] || null;
    }
}
exports.LocationRepository = LocationRepository;
