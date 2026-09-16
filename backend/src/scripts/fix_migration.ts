import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'seo_platform'
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'seo_audits'
      );
    `);
    
    console.log('seo_audits table exists?', res.rows[0].exists);

    if (!res.rows[0].exists) {
      console.log('Deleting migration record for 007...');
      await pool.query(`DELETE FROM migrations WHERE name = '007_create_seo_audits_tables.sql'`);
      console.log('Record deleted.');
      
      const content = fs.readFileSync(path.resolve(__dirname, '../../../../database/migrations/007_create_seo_audits_tables.sql'), 'utf-8');
      
      console.log('Running 007 migration directly...');
      await pool.query(content);
      console.log('007 migration run successfully!');
      
      await pool.query(`INSERT INTO migrations (name) VALUES ('007_create_seo_audits_tables.sql')`);
      console.log('Migration record inserted.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();
