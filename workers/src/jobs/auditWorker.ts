import { Job } from 'bullmq';
import { Pool } from 'pg';
import { AuditCrawler } from '../../../backend/src/modules/audits/engine/crawler';
import { AuditStatus, AuditType } from '../../../backend/src/modules/audits/types';

// Ensure we have a DB connection
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }
);

export async function handleAuditJob(job: Job) {
  const { auditId, organizationId, businessId, locationId, targetUrl, maxPages, crawlDepth } = job.data;
  
  try {
    // 1. Mark as RUNNING
    await pool.query(
      `UPDATE seo_audits SET status = $1, started_at = NOW() WHERE id = $2 AND organization_id = $3`,
      [AuditStatus.RUNNING, auditId, organizationId]
    );

    // 2. Fetch the type
    const { rows } = await pool.query(
      `SELECT type FROM seo_audits WHERE id = $1 AND organization_id = $2`,
      [auditId, organizationId]
    );
    const auditType: AuditType = rows[0]?.type || AuditType.FULL_AUDIT;

    // 3. Initialize Crawler
    const crawler = new AuditCrawler(targetUrl, { maxPages, maxDepth: crawlDepth });
    
    let issuesFound = 0;
    let pagesCrawled = 0;

    // 4. Crawl
    for await (const result of crawler.crawl(targetUrl, auditType)) {
      pagesCrawled++;
      
      // Persist page
      const pageRes = await pool.query(
        `INSERT INTO seo_audit_pages 
         (organization_id, audit_id, url, normalized_url, status_code, content_type, title, meta_description, load_time_ms, crawled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING id`,
        [
          organizationId, auditId, result.context.url, result.context.normalizedUrl,
          result.context.statusCode, result.context.contentType,
          result.context.$ ? result.context.$('title').first().text().trim() : null,
          result.context.$ ? result.context.$('meta[name="description" i]').first().attr('content')?.trim() : null,
          result.context.loadTimeMs
        ]
      );
      
      const pageId = pageRes.rows[0].id;

      // Persist issues
      for (const issue of result.issues) {
        issuesFound++;
        await pool.query(
          `INSERT INTO seo_audit_issues 
           (organization_id, audit_id, page_id, check_code, category, severity, title, description, recommendation, evidence)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            organizationId, auditId, pageId, issue.code, issue.category, issue.severity,
            issue.title, issue.description, issue.recommendation, JSON.stringify(issue.evidence)
          ]
        );
      }
      
      // Update progress
      await job.updateProgress(Math.floor((pagesCrawled / (maxPages || 100)) * 100));
    }

    // 5. Update Audit final status and aggregate stats
    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_issues,
        SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_count,
        SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) as high_count,
        SUM(CASE WHEN severity = 'MEDIUM' THEN 1 ELSE 0 END) as medium_count,
        SUM(CASE WHEN severity = 'LOW' THEN 1 ELSE 0 END) as low_count
      FROM seo_audit_issues
      WHERE audit_id = $1
    `, [auditId]);
    
    const stats = statsRes.rows[0];

    await pool.query(
      `UPDATE seo_audits SET 
        status = $1, 
        completed_at = NOW(), 
        pages_crawled = $2, 
        pages_discovered = $3,
        issues_count = $4,
        critical_count = $5,
        high_count = $6,
        medium_count = $7,
        low_count = $8,
        score = $9
       WHERE id = $10 AND organization_id = $11`,
      [
        AuditStatus.COMPLETED,
        pagesCrawled,
        pagesCrawled, // Could be more if discovered is tracked separately
        stats.total_issues || 0,
        stats.critical_count || 0,
        stats.high_count || 0,
        stats.medium_count || 0,
        stats.low_count || 0,
        Math.max(0, 100 - (stats.critical_count * 10) - (stats.high_count * 5) - (stats.medium_count * 2)), // Simple score
        auditId, 
        organizationId
      ]
    );

    return { pagesCrawled, issuesFound };
  } catch (error: any) {
    console.error(`Audit Job failed for ${auditId}:`, error);
    await pool.query(
      `UPDATE seo_audits SET status = $1, completed_at = NOW() WHERE id = $2 AND organization_id = $3`,
      [AuditStatus.FAILED, auditId, organizationId]
    );
    throw error;
  }
}
