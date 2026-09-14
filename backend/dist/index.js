"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const health_1 = require("./routes/health");
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/v1/health', health_1.healthRouter);
// Error handling
app.use(errorHandler_1.errorHandler);
const db_1 = require("./config/db");
app.listen(port, async () => {
    console.log(`[Backend] Server running on port ${port}`);
    // Verify Database Connection
    const dbConnected = await (0, db_1.checkDbConnection)();
    if (dbConnected) {
        console.log('[Backend] Successfully connected to PostgreSQL Database');
    }
    else {
        console.log('[Backend] Failed to connect to PostgreSQL Database');
    }
});
