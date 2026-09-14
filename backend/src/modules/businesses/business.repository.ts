import pool from '../../config/db';
import { CreateBusinessInput, UpdateBusinessInput, ListBusinessesQuery } from './business.schema';
import { Business, PaginatedBusinesses } from './business.types';

export class BusinessRepository {
  static async list(organizationId: string, query: ListBusinessesQuery): Promise<PaginatedBusinesses> {
    const { page, limit, search, status } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['b.organization_id = $1'];
    const values: any[] = [organizationId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`b.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    } else {
      // By default, only show ACTIVE businesses unless specified
      conditions.push(`b.status = $${paramIndex}`);
      values.push('ACTIVE');
      paramIndex++;
    }

    if (search) {
      conditions.push(`(b.name ILIKE $${paramIndex} OR b.primary_category ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Query for total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM businesses b ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Query for paginated data with location count
    const dataQuery = `
      SELECT b.*, 
             (SELECT COUNT(*) FROM locations l WHERE l.business_id = b.id AND l.status = 'ACTIVE') as location_count
      FROM businesses b
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

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

  static async findById(organizationId: string, businessId: string): Promise<Business | null> {
    const result = await pool.query(
      `SELECT * FROM businesses WHERE id = $1 AND organization_id = $2`,
      [businessId, organizationId]
    );
    return result.rows[0] || null;
  }

  static async findBySlug(organizationId: string, slug: string): Promise<Business | null> {
    const result = await pool.query(
      `SELECT * FROM businesses WHERE slug = $1 AND organization_id = $2`,
      [slug, organizationId]
    );
    return result.rows[0] || null;
  }

  static async create(organizationId: string, slug: string, payload: CreateBusinessInput): Promise<Business> {
    const result = await pool.query(
      `INSERT INTO businesses (
        organization_id, name, slug, website_url, phone, primary_category, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        organizationId,
        payload.name,
        slug,
        payload.websiteUrl || null,
        payload.phone || null,
        payload.primaryCategory || null,
        payload.description || null
      ]
    );
    return result.rows[0];
  }

  static async update(organizationId: string, businessId: string, payload: UpdateBusinessInput): Promise<Business | null> {
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (payload.name !== undefined) {
      setFields.push(`name = $${paramIndex++}`);
      values.push(payload.name);
    }
    if (payload.websiteUrl !== undefined) {
      setFields.push(`website_url = $${paramIndex++}`);
      values.push(payload.websiteUrl || null);
    }
    if (payload.phone !== undefined) {
      setFields.push(`phone = $${paramIndex++}`);
      values.push(payload.phone || null);
    }
    if (payload.primaryCategory !== undefined) {
      setFields.push(`primary_category = $${paramIndex++}`);
      values.push(payload.primaryCategory || null);
    }
    if (payload.description !== undefined) {
      setFields.push(`description = $${paramIndex++}`);
      values.push(payload.description || null);
    }
    if (payload.status !== undefined) {
      setFields.push(`status = $${paramIndex++}`);
      values.push(payload.status);
    }

    if (setFields.length === 0) {
      return this.findById(organizationId, businessId);
    }

    setFields.push(`updated_at = NOW()`);

    values.push(businessId);
    values.push(organizationId);

    const query = `
      UPDATE businesses
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex++} AND organization_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}
