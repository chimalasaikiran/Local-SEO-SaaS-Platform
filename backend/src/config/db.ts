import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Use DATABASE_URL if provided (standard for Neon), otherwise fallback to individual credentials
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Neon PostgreSQL requires SSL
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }
);

export const checkDbConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    console.error('[Database] Connection error:', error);
    return false;
  }
};

export default pool;
