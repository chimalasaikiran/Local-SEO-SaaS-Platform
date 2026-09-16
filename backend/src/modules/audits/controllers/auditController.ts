import { Request, Response } from 'express';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { auditService } from '../services/auditService';
import { createAuditSchema, updateIssueSchema, getIssuesQuerySchema } from '../schemas';

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

const auditQueue = new Queue('seo-audit-jobs', { connection: redisConnection });

export class AuditController {
  
  async listAudits(req: Request, res: Response) {
    try {
      const orgId = req.params.organizationId;
      if (!orgId) return res.status(401).json({ error: 'Unauthorized' });

      const audits = await auditService.getAudits(orgId);
      res.json(audits);
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  async createAudit(req: Request, res: Response) {
    try {
      const orgId = req.params.organizationId;
      if (!orgId) return res.status(401).json({ error: 'Unauthorized' });

      const body = createAuditSchema.parse(req.body);
      const audit = await auditService.createAudit(orgId, body.business_id, body.location_id, body.type, body.target_url);

      // Queue the job
      await auditQueue.add('runAudit', {
        auditId: audit.id,
        organizationId: orgId,
        businessId: body.business_id,
        locationId: body.location_id,
        targetUrl: body.target_url,
        maxPages: body.max_pages,
        crawlDepth: body.crawl_depth,
      });

      res.status(201).json(audit);
    } catch (e: any) {
      res.status(400).json({ success: false, error: { message: e.message } });
    }
  }

  async getAudit(req: Request, res: Response) {
    try {
      const orgId = req.params.organizationId;
      if (!orgId) return res.status(401).json({ error: 'Unauthorized' });

      const audit = await auditService.getAuditById(orgId, req.params.id);
      if (!audit) return res.status(404).json({ error: 'Not found' });

      res.json(audit);
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  async getPages(req: Request, res: Response) {
    try {
      const orgId = req.params.organizationId;
      if (!orgId) return res.status(401).json({ error: 'Unauthorized' });

      const pages = await auditService.getAuditPages(orgId, req.params.id);
      res.json(pages);
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  async getIssues(req: Request, res: Response) {
    try {
      const orgId = req.params.organizationId;
      if (!orgId) return res.status(401).json({ error: 'Unauthorized' });

      const filters = getIssuesQuerySchema.parse(req.query);
      const issues = await auditService.getAuditIssues(orgId, req.params.id, filters);
      res.json(issues);
    } catch (e: any) {
      res.status(400).json({ success: false, error: { message: e.message } });
    }
  }

  async updateIssue(req: Request, res: Response) {
    try {
      const orgId = req.params.organizationId;
      if (!orgId) return res.status(401).json({ error: 'Unauthorized' });

      const body = updateIssueSchema.parse(req.body);
      const updated = await auditService.updateIssueStatus(orgId, req.params.id, req.params.issueId, body.status);
      
      if (!updated) return res.status(404).json({ error: 'Not found' });

      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ success: false, error: { message: e.message } });
    }
  }
}

export const auditController = new AuditController();
