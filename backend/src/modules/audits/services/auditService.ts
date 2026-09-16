import pool from '../../../config/db';
import { AuditType, AuditStatus, IssueSeverity, SeoAudit, SeoAuditPage, SeoAuditIssue } from '../types';

export class AuditService {
  
  async createAudit(orgId: string, businessId: string, locationId: string | undefined, type: AuditType, targetUrl: string): Promise<SeoAudit> {
    const res = await pool.query(
      `INSERT INTO seo_audits (organization_id, business_id, location_id, type, target_url, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [orgId, businessId, locationId || null, type, targetUrl, AuditStatus.QUEUED]
    );
    return res.rows[0];
  }

  async getAudits(orgId: string, limit = 50, offset = 0): Promise<SeoAudit[]> {
    const res = await pool.query(
      `SELECT * FROM seo_audits WHERE organization_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [orgId, limit, offset]
    );
    return res.rows;
  }

  async getAuditById(orgId: string, auditId: string): Promise<SeoAudit | null> {
    const res = await pool.query(
      `SELECT * FROM seo_audits WHERE id = $1 AND organization_id = $2`,
      [auditId, orgId]
    );
    return res.rows[0] || null;
  }

  async getAuditPages(orgId: string, auditId: string): Promise<SeoAuditPage[]> {
    const res = await pool.query(
      `SELECT * FROM seo_audit_pages WHERE audit_id = $1 AND organization_id = $2 ORDER BY url`,
      [auditId, orgId]
    );
    return res.rows;
  }

  async getAuditIssues(orgId: string, auditId: string, filters: any = {}): Promise<SeoAuditIssue[]> {
    let query = `SELECT * FROM seo_audit_issues WHERE audit_id = $1 AND organization_id = $2`;
    const params: any[] = [auditId, orgId];
    let paramIdx = 3;

    if (filters.severity) {
      query += ` AND severity = $${paramIdx++}`;
      params.push(filters.severity);
    }
    if (filters.status) {
      query += ` AND status = $${paramIdx++}`;
      params.push(filters.status);
    }

    query += ` ORDER BY severity, created_at DESC LIMIT 500`;

    const res = await pool.query(query, params);
    return res.rows;
  }

  async updateIssueStatus(orgId: string, auditId: string, issueId: string, status: string): Promise<SeoAuditIssue | null> {
    const res = await pool.query(
      `UPDATE seo_audit_issues SET status = $1 WHERE id = $2 AND audit_id = $3 AND organization_id = $4 RETURNING *`,
      [status, issueId, auditId, orgId]
    );
    return res.rows[0] || null;
  }
}

export const auditService = new AuditService();
