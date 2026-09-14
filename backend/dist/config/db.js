"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDbConnection = void 0;
const pg_1 = require("pg");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load .env from project root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
// Use DATABASE_URL if provided (standard for Neon), otherwise fallback to individual credentials
const pool = new pg_1.Pool(process.env.DATABASE_URL
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
    });
const checkDbConnection = async () => {
    try {
        const client = await pool.connect();
        client.release();
        return true;
    }
    catch (error) {
        console.error('[Database] Connection error:', error);
        return false;
    }
};
exports.checkDbConnection = checkDbConnection;
exports.default = pool;
