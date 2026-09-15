import { Pool } from 'pg';
import { Job } from 'bullmq';


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const handleRankTrackingJob = async (jobData: any) => {
  const { organizationId, runId, configId, jobId, keywordId, gridPointId } = jobData;

  const client = await pool.connect();
  try {
    // 1. Mark job as running
    await client.query(`UPDATE rank_tracking_jobs SET status = 'RUNNING', started_at = NOW(), attempts = attempts + 1 WHERE id = $1`, [jobId]);

    // 2. Fetch required info: config, keyword, grid point
    const configResult = await client.query(`SELECT * FROM rank_tracking_configs WHERE id = $1 AND organization_id = $2`, [configId, organizationId]);
    if (configResult.rows.length === 0) throw new Error('Config not found or tenant mismatch');
    const config = configResult.rows[0];

    const keywordResult = await client.query(`SELECT * FROM keywords WHERE id = $1 AND organization_id = $2`, [keywordId, organizationId]);
    if (keywordResult.rows.length === 0) throw new Error('Keyword not found or tenant mismatch');
    const keyword = keywordResult.rows[0];

    const gridPointResult = await client.query(`SELECT * FROM rank_grid_points WHERE id = $1 AND organization_id = $2`, [gridPointId, organizationId]);
    if (gridPointResult.rows.length === 0) throw new Error('Grid point not found or tenant mismatch');
    const gridPoint = gridPointResult.rows[0];

    // 3. Resolve Ranking Provider (Hardcoding to No-op per requirement for now)
    // Later this would be dynamically loaded from a registry
    // Because this is a worker process and the registry is in the backend module, we can simulate the noop failure.
    // In a real app we'd share the registry package or API.
    
    // Simulating Provider resolving and request
    const providerName = 'NOOP';
    
    // NOOP provider action -> throws not configured error since it's an unconfigured environment
    if (providerName === 'NOOP') {
      throw new Error('RANKING_PROVIDER_NOT_CONFIGURED');
    }

    // In a real implementation with a valid provider:
    // const resultPosition = await provider.fetchRanking(...)
    //
    // await client.query(
    //   `INSERT INTO keyword_rankings (organization_id, keyword_id, grid_point_id, run_id, provider, search_engine, device, position, checked_at)
    //    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
    //   [organizationId, keywordId, gridPointId, runId, providerName, config.search_engine, config.device, resultPosition]
    // );

    // Mark job completed (only reached if a provider successfully completes)
    await client.query(`UPDATE rank_tracking_jobs SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1`, [jobId]);

  } catch (error: any) {
    // Mark job failed
    const errorCode = error.message === 'RANKING_PROVIDER_NOT_CONFIGURED' ? 'RANKING_PROVIDER_NOT_CONFIGURED' : 'RANKING_PROVIDER_ERROR';
    await client.query(`UPDATE rank_tracking_jobs SET status = 'FAILED', completed_at = NOW(), error_code = $1, error_message = $2 WHERE id = $3`, [errorCode, error.message, jobId]);
  } finally {
    // Update Run Progress
    try {
      const runRes = await client.query(`SELECT total_jobs, completed_jobs, failed_jobs FROM rank_tracking_runs WHERE id = $1`, [runId]);
      if (runRes.rows.length > 0) {
        const run = runRes.rows[0];
        
        // Count jobs based on status in DB
        const countRes = await client.query(`
          SELECT 
            COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
            COUNT(*) FILTER (WHERE status = 'FAILED') as failed
          FROM rank_tracking_jobs WHERE run_id = $1
        `, [runId]);
        
        const completed = parseInt(countRes.rows[0].completed);
        const failed = parseInt(countRes.rows[0].failed);
        const total = run.total_jobs;
        
        let newStatus = 'RUNNING';
        let completedAt = null;
        
        if (completed + failed >= total) {
          if (completed === total) newStatus = 'COMPLETED';
          else if (completed === 0) newStatus = 'FAILED';
          else newStatus = 'PARTIAL';
          completedAt = new Date();
        }

        const updateQuery = completedAt 
          ? `UPDATE rank_tracking_runs SET status = $1, completed_jobs = $2, failed_jobs = $3, completed_at = $4 WHERE id = $5`
          : `UPDATE rank_tracking_runs SET status = $1, completed_jobs = $2, failed_jobs = $3 WHERE id = $4`;
          
        if (completedAt) {
          await client.query(updateQuery, [newStatus, completed, failed, completedAt, runId]);
        } else {
          await client.query(updateQuery, [newStatus, completed, failed, runId]);
        }
      }
    } catch (e) {
      console.error('Failed to update run progress', e);
    }

    client.release();
  }
};
