import { Request, Response } from 'express';
import pool from '../../config/db';
import { ROLES } from '../../utils/roles';

export const getMembers = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.organizationId;
    const { rows } = await pool.query(
      `SELECT om.id as membership_id, om.role, u.id, u.email, u.name, om.created_at
       FROM organization_memberships om
       JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = $1
       ORDER BY om.created_at DESC`,
      [orgId]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('[Members Controller - Get]', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch members.' } });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.organizationId;
    const { email, role } = req.body;

    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      // For MVP, user must exist. No invitation infra yet.
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found. They must register first.' } });
    }
    const userId = userRes.rows[0].id;

    // Check if already a member
    const existingRes = await pool.query(
      'SELECT id FROM organization_memberships WHERE organization_id = $1 AND user_id = $2',
      [orgId, userId]
    );
    if (existingRes.rows.length > 0) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'User is already a member of this organization.' } });
    }

    const { rows } = await pool.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING id, role, created_at`,
      [orgId, userId, role]
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('[Members Controller - Add]', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add member.' } });
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.organizationId;
    const memberId = req.params.memberId;
    const { role } = req.body;
    const currentUserRole = req.organizationMembership!.role;

    const memberRes = await pool.query(
      'SELECT role FROM organization_memberships WHERE id = $1 AND organization_id = $2',
      [memberId, orgId]
    );

    if (memberRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Membership not found.' } });
    }

    const currentRoleOfMember = memberRes.rows[0].role;

    if (currentUserRole !== ROLES.OWNER && role === ROLES.OWNER) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only owners can promote others to owner.' } });
    }

    if (currentRoleOfMember === ROLES.OWNER && role !== ROLES.OWNER) {
      // Trying to demote an owner. Check if they are the last owner.
      const ownerCountRes = await pool.query(
        "SELECT COUNT(*) FROM organization_memberships WHERE organization_id = $1 AND role = 'OWNER'",
        [orgId]
      );
      if (parseInt(ownerCountRes.rows[0].count) <= 1) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Cannot demote the last owner.' } });
      }
    }

    const { rows } = await pool.query(
      `UPDATE organization_memberships 
       SET role = $1, updated_at = NOW() 
       WHERE id = $2 AND organization_id = $3 
       RETURNING id, role`,
      [role, memberId, orgId]
    );

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('[Members Controller - Update]', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update member role.' } });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.organizationId;
    const memberId = req.params.memberId;

    const memberRes = await pool.query(
      'SELECT role FROM organization_memberships WHERE id = $1 AND organization_id = $2',
      [memberId, orgId]
    );

    if (memberRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Membership not found.' } });
    }

    const currentRoleOfMember = memberRes.rows[0].role;

    if (currentRoleOfMember === ROLES.OWNER) {
      const ownerCountRes = await pool.query(
        "SELECT COUNT(*) FROM organization_memberships WHERE organization_id = $1 AND role = 'OWNER'",
        [orgId]
      );
      if (parseInt(ownerCountRes.rows[0].count) <= 1) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Cannot remove the last owner.' } });
      }
    }

    await pool.query('DELETE FROM organization_memberships WHERE id = $1 AND organization_id = $2', [memberId, orgId]);

    return res.json({ success: true, message: 'Member removed successfully.' });
  } catch (error) {
    console.error('[Members Controller - Remove]', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to remove member.' } });
  }
};
