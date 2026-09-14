import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from '../auth.routes';
import pool from '../../../config/db';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);

describe('Auth Endpoints', () => {
  const testEmail = `test${Date.now()}@example.com`;

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    await pool.end();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: testEmail,
        password: 'securePassword123',
        organizationName: 'Test Org'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.organizations).toHaveLength(1);
    expect(res.body.data.organizations[0].role).toBe('OWNER');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should not allow duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: testEmail,
        password: 'securePassword123',
        organizationName: 'Test Org'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  let sessionCookie: string;

  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'securePassword123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
    
    // Save cookie for subsequent tests
    sessionCookie = res.headers['set-cookie'][0].split(';')[0];
  });

  it('should fetch current user data using /me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.organizations).toHaveLength(1);
  });

  it('should reject unauthenticated /me requests', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should logout successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
