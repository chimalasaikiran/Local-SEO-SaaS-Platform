"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function runMigrations() {
    const client = await db_1.default.connect();
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
        const migrationsDir = path_1.default.resolve(__dirname, '../../../database/migrations');
        const files = fs_1.default.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
        for (const file of files) {
            const { rows } = await client.query('SELECT name FROM migrations WHERE name = $1', [file]);
            if (rows.length === 0) {
                console.log(`Executing migration: ${file}`);
                const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), 'utf8');
                await client.query(sql);
                await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
                console.log(`Successfully applied: ${file}`);
            }
            else {
                console.log(`Skipping applied migration: ${file}`);
            }
        }
        await client.query('COMMIT');
        console.log('Migrations completed successfully.');
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        process.exit(1);
    }
    finally {
        client.release();
        db_1.default.end();
    }
}
runMigrations();
