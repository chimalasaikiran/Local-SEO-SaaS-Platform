"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.updateMemberRole = exports.addMember = exports.getMembers = void 0;
const db_1 = __importDefault(require("../../config/db"));
const roles_1 = require("../../utils/roles");
const getMembers = async (req, res) => {
    try {
        const orgId = req.params.organizationId;
        const { rows } = await db_1.default.query(`SELECT om.id as membership_id, om.role, u.id, u.email, u.name, om.created_at
       FROM organization_memberships om
       JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = $1
       ORDER BY om.created_at DESC`, [orgId]);
        return res.json({ success: true, data: rows });
    }
    catch (error) {
        console.error('[Members Controller - Get]', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch members.' } });
    }
};
exports.getMembers = getMembers;
const addMember = async (req, res) => {
    try {
        const orgId = req.params.organizationId;
        const { email, role } = req.body;
        const userRes = await db_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            // For MVP, user must exist. No invitation infra yet.
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found. They must register first.' } });
        }
        const userId = userRes.rows[0].id;
        // Check if already a member
        const existingRes = await db_1.default.query('SELECT id FROM organization_memberships WHERE organization_id = $1 AND user_id = $2', [orgId, userId]);
        if (existingRes.rows.length > 0) {
            return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'User is already a member of this organization.' } });
        }
        const { rows } = await db_1.default.query(`INSERT INTO organization_memberships (organization_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING id, role, created_at`, [orgId, userId, role]);
        return res.status(201).json({ success: true, data: rows[0] });
    }
    catch (error) {
        console.error('[Members Controller - Add]', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add member.' } });
    }
};
exports.addMember = addMember;
const updateMemberRole = async (req, res) => {
    try {
        const orgId = req.params.organizationId;
        const memberId = req.params.memberId;
        const { role } = req.body;
        const currentUserRole = req.organizationMembership.role;
        const memberRes = await db_1.default.query('SELECT role FROM organization_memberships WHERE id = $1 AND organization_id = $2', [memberId, orgId]);
        if (memberRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Membership not found.' } });
        }
        const currentRoleOfMember = memberRes.rows[0].role;
        if (currentUserRole !== roles_1.ROLES.OWNER && role === roles_1.ROLES.OWNER) {
            return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only owners can promote others to owner.' } });
        }
        if (currentRoleOfMember === roles_1.ROLES.OWNER && role !== roles_1.ROLES.OWNER) {
            // Trying to demote an owner. Check if they are the last owner.
            const ownerCountRes = await db_1.default.query("SELECT COUNT(*) FROM organization_memberships WHERE organization_id = $1 AND role = 'OWNER'", [orgId]);
            if (parseInt(ownerCountRes.rows[0].count) <= 1) {
                return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Cannot demote the last owner.' } });
            }
        }
        const { rows } = await db_1.default.query(`UPDATE organization_memberships 
       SET role = $1, updated_at = NOW() 
       WHERE id = $2 AND organization_id = $3 
       RETURNING id, role`, [role, memberId, orgId]);
        return res.json({ success: true, data: rows[0] });
    }
    catch (error) {
        console.error('[Members Controller - Update]', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update member role.' } });
    }
};
exports.updateMemberRole = updateMemberRole;
const removeMember = async (req, res) => {
    try {
        const orgId = req.params.organizationId;
        const memberId = req.params.memberId;
        const memberRes = await db_1.default.query('SELECT role FROM organization_memberships WHERE id = $1 AND organization_id = $2', [memberId, orgId]);
        if (memberRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Membership not found.' } });
        }
        const currentRoleOfMember = memberRes.rows[0].role;
        if (currentRoleOfMember === roles_1.ROLES.OWNER) {
            const ownerCountRes = await db_1.default.query("SELECT COUNT(*) FROM organization_memberships WHERE organization_id = $1 AND role = 'OWNER'", [orgId]);
            if (parseInt(ownerCountRes.rows[0].count) <= 1) {
                return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Cannot remove the last owner.' } });
            }
        }
        await db_1.default.query('DELETE FROM organization_memberships WHERE id = $1 AND organization_id = $2', [memberId, orgId]);
        return res.json({ success: true, message: 'Member removed successfully.' });
    }
    catch (error) {
        console.error('[Members Controller - Remove]', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to remove member.' } });
    }
};
exports.removeMember = removeMember;
