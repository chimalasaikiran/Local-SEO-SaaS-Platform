import pool from '../config/db';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('Starting DB migrations...');
    await client.query('BEGIN');
    
    // Ensure extensions exist
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // Create migrations table to track state
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    
    const migrationsDir = path.resolve(__dirname, '../../../database/migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    
    for (const file of files) {
      const { rows } = await client.query('SELECT name FROM migrations WHERE name = $1', [file]);
      if (rows.length === 0) {
        console.log(`Executing migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        console.log(`Successfully applied: ${file}`);
      } else {
        console.log(`Skipping applied migration: ${file}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('Migrations completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

runMigrations();
