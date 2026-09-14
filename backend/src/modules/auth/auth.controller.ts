import { Request, Response } from 'express';
import pool from '../../config/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SESSION_DURATION_DAYS = 30;

function createCookie(res: Response, sessionId: string) {
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

function clearCookie(res: Response) {
  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
  });
}

export const register = async (req: Request, res: Response) => {
  const { name, email, password, organizationName } = req.body;
  const client = await pool.connect();

  try {
    // Check if email already exists
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email is already registered.' }
      });
    }

    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(password, 10);

    // Create User
    const userRes = await client.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, passwordHash, name]
    );
    const user = userRes.rows[0];

    // Create Organization
    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + crypto.randomBytes(4).toString('hex');
    const orgRes = await client.query(
      'INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id, name, slug',
      [organizationName, slug]
    );
    const org = orgRes.rows[0];

    // Create Membership (OWNER)
    await client.query(
      'INSERT INTO organization_memberships (organization_id, user_id, role) VALUES ($1, $2, $3)',
      [org.id, user.id, 'OWNER']
    );

    // Create Session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
    const sessionRes = await client.query(
      'INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id',
      [user.id, expiresAt]
    );
    const session = sessionRes.rows[0];

    await client.query('COMMIT');

    createCookie(res, session.id);

    return res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        organizations: [{ ...org, role: 'OWNER' }]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Auth Controller - Register]', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed.' }
    });
  } finally {
    client.release();
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    const { rows } = await pool.query('SELECT id, email, name, password_hash, is_active FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Email or password is incorrect.' }
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Email or password is incorrect.' }
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
    const sessionRes = await pool.query(
      'INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id',
      [user.id, expiresAt]
    );

    const orgsRes = await pool.query(
      `SELECT o.id, o.name, o.slug, om.role
       FROM organizations o
       JOIN organization_memberships om ON o.id = om.organization_id
       WHERE om.user_id = $1`,
      [user.id]
    );

    createCookie(res, sessionRes.rows[0].id);

    return res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        organizations: orgsRes.rows
      }
    });

  } catch (error) {
    console.error('[Auth Controller - Login]', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed.' }
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    }
    clearCookie(res);
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('[Auth Controller - Logout]', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Logout failed.' }
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' }
    });
  }

  try {
    const orgsRes = await pool.query(
      `SELECT o.id, o.name, o.slug, om.role
       FROM organizations o
       JOIN organization_memberships om ON o.id = om.organization_id
       WHERE om.user_id = $1`,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: {
        user: { id: req.user.id, email: req.user.email, name: req.user.name },
        organizations: orgsRes.rows
      }
    });
  } catch (error) {
    console.error('[Auth Controller - GetMe]', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user data.' }
    });
  }
};
