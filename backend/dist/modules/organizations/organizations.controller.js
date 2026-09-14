"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganization = exports.getOrganization = exports.getOrganizations = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getOrganizations = async (req, res) => {
    try {
        const { rows } = await db_1.default.query(`SELECT o.id, o.name, o.slug, om.role, o.created_at, o.updated_at
       FROM organizations o
       JOIN organization_memberships om ON o.id = om.organization_id
       WHERE om.user_id = $1
       ORDER BY o.created_at DESC`, [req.user.id]);
        return res.json({ success: true, data: rows });
    }
    catch (error) {
        console.error('[Organizations Controller - Get]', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch organizations.' } });
    }
};
exports.getOrganizations = getOrganizations;
const getOrganization = async (req, res) => {
    try {
        // The user has already been authorized for this org by the middleware
        const orgId = req.params.organizationId;
        const { rows } = await db_1.default.query(`SELECT id, name, slug, created_at, updated_at
       FROM organizations
       WHERE id = $1`, [orgId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Organization not found.' } });
        }
        return res.json({ success: true, data: { ...rows[0], role: req.organizationMembership.role } });
    }
    catch (error) {
        console.error('[Organizations Controller - GetOne]', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch organization.' } });
    }
};
exports.getOrganization = getOrganization;
const updateOrganization = async (req, res) => {
    try {
        const orgId = req.params.organizationId;
        const { name } = req.body;
        const { rows } = await db_1.default.query(`UPDATE organizations 
       SET name = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, name, slug, created_at, updated_at`, [name, orgId]);
        return res.json({ success: true, data: rows[0] });
    }
    catch (error) {
        console.error('[Organizations Controller - Update]', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update organization.' } });
    }
};
exports.updateOrganization = updateOrganization;
