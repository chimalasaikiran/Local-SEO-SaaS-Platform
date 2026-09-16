import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'localseo'
});

export const handleCompetitorRefreshJob = async (data: any) => {
  console.log(`[CompetitorWorker] Starting refresh for competitor ${data.competitorId} in org ${data.organizationId}`);
  
  const client = await pool.connect();
  try {
    // 1. Fetch current competitor data
    const competitorRes = await client.query(
      `SELECT * FROM competitors WHERE id = $1 AND organization_id = $2`,
      [data.competitorId, data.organizationId]
    );

    if (competitorRes.rows.length === 0) {
      throw new Error(`Competitor ${data.competitorId} not found`);
    }

    const competitor = competitorRes.rows[0];
    
    // In a real scenario, we would trigger an OSM fetch or ranking provider check here based on competitor.source
    // and geo_place_id to refresh data.
    
    // For now, simulate refreshing data (we can update last_seen_at)
    
    await client.query('BEGIN');
    
    const updateRes = await client.query(
      `UPDATE competitors SET last_seen_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [competitor.id]
    );
    
    const updatedCompetitor = updateRes.rows[0];

    // 2. Take a snapshot
    await client.query(
      `INSERT INTO competitor_snapshots 
       (organization_id, competitor_id, name, category, website_url, phone, latitude, longitude, distance_meters, source, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        data.organizationId,
        competitor.id,
        updatedCompetitor.name,
        updatedCompetitor.category,
        updatedCompetitor.website_url,
        updatedCompetitor.phone,
        updatedCompetitor.latitude,
        updatedCompetitor.longitude,
        updatedCompetitor.distance_meters,
        updatedCompetitor.source,
        JSON.stringify({ refresh: true }) // Any extra metadata
      ]
    );

    await client.query('COMMIT');
    console.log(`[CompetitorWorker] Refresh and snapshot complete for competitor ${data.competitorId}`);
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`[CompetitorWorker] Error refreshing competitor ${data.competitorId}:`, error);
    throw error;
  } finally {
    client.release();
  }
};
