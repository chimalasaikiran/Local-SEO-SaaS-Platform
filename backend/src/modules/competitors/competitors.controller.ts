import { Request, Response } from 'express';
import pool from '../../config/db';
import { CompetitorDiscoveryService } from './services/CompetitorDiscoveryService';
import { z } from 'zod';

const discoveryService = new CompetitorDiscoveryService();

const DiscoverSchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid(),
  category: z.string().min(2),
  radiusMeters: z.coerce.number().min(100).max(50000).default(5000),
  limit: z.coerce.number().min(1).max(500).default(100)
});

const UpdateCompetitorSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  websiteUrl: z.string().url().or(z.literal('')).nullable().optional(),
  phone: z.string().or(z.literal('')).nullable().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional()
});

export class CompetitorsController {
  static async list(req: Request, res: Response) {
    try {
      const organizationId = req.organizationMembership!.organizationId;
      const { locationId, status } = req.query;

      let query = `
        SELECT c.*, g.last_synced_at 
        FROM competitors c
        LEFT JOIN geo_places g ON c.geo_place_id = g.id
        WHERE c.organization_id = $1
      `;
      const values: any[] = [organizationId];
      let paramIdx = 2;

      if (locationId) {
        query += ` AND c.location_id = $${paramIdx++}`;
        values.push(locationId);
      }

      if (status) {
        query += ` AND c.status = $${paramIdx++}`;
        values.push(status);
      } else {
        query += ` AND c.status != 'ARCHIVED'`;
      }

      query += ` ORDER BY c.distance_meters ASC`;

      const result = await pool.query(query, values);
      return res.json({ data: result.rows });
    } catch (error) {
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list competitors' } });
    }
  }

  static async discover(req: Request, res: Response) {
    try {
      const organizationId = req.organizationMembership!.organizationId;
      const payload = DiscoverSchema.parse(req.body);

      const result = await discoveryService.discover({
        organizationId,
        ...payload
      });

      return res.json({ data: result });
    } catch (error: any) {
      console.error('Discover competitors error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
      }
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: error.message || 'Failed to discover competitors' } });
    }
  }

  static async track(req: Request, res: Response) {
    try {
      const organizationId = req.organizationMembership!.organizationId;
      const { competitorId } = req.params;

      const result = await pool.query(
        `UPDATE competitors SET status = 'ACTIVE', updated_at = NOW()
         WHERE id = $1 AND organization_id = $2 RETURNING *`,
        [competitorId, organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
      }

      return res.json({ data: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to track competitor' } });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const organizationId = req.organizationMembership!.organizationId;
      const { competitorId } = req.params;
      const payload = UpdateCompetitorSchema.parse(req.body);

      const setFields: string[] = [];
      const values: any[] = [];
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

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
      }

      return res.json({ data: result.rows[0] });
    } catch (error) {
      console.error('Update competitor error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
      }
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update competitor' } });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const organizationId = req.organizationMembership!.organizationId;
      const { competitorId } = req.params;

      const result = await pool.query(
        `UPDATE competitors SET status = 'ARCHIVED', updated_at = NOW()
         WHERE id = $1 AND organization_id = $2 RETURNING *`,
        [competitorId, organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
      }

      return res.json({ data: { success: true } });
    } catch (error) {
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to archive competitor' } });
    }
  }
}
