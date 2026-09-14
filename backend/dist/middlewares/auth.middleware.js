"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const db_1 = __importDefault(require("../config/db"));
const requireAuth = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sessionId;
        if (!sessionId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication is required.'
                }
            });
        }
        // Validate session
        const { rows } = await db_1.default.query(`SELECT s.id as session_id, u.id, u.email, u.name, s.expires_at 
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1 AND u.is_active = true`, [sessionId]);
        const session = rows[0];
        if (!session || new Date() > new Date(session.expires_at)) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication is required.'
                }
            });
        }
        req.user = {
            id: session.id,
            email: session.email,
            name: session.name,
            sessionId: session.session_id
        };
        next();
    }
    catch (error) {
        console.error('[AuthMiddleware] Error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An internal server error occurred.'
            }
        });
    }
};
exports.requireAuth = requireAuth;
