import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from '../../auth/auth.routes';
import { businessRoutes } from '../business.routes';
import { organizationsRouter } from '../../organizations/organizations.routes';
import pool from '../../../config/db';
import { errorHandler } from '../../../middlewares/errorHandler';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/organizations', organizationsRouter);
app.use('/api/v1/organizations/:organizationId/businesses', businessRoutes);
app.use(errorHandler);

describe('Business and Tenant Isolation Endpoints', () => {
  const emailA = `testA${Date.now()}@example.com`;
  const emailB = `testB${Date.now()}@example.com`;
  let sessionA: string;
  let sessionB: string;
  let orgAId: string;
  let orgBId: string;
  let businessAId: string;

  beforeAll(async () => {
    // Register User A (Org A)
    let res = await request(app).post('/api/v1/auth/register').send({
      name: 'User A', email: emailA, password: 'password', organizationName: 'Org A'
    });
    sessionA = res.headers['set-cookie'][0].split(';')[0];
    orgAId = res.body.data.organizations[0].id;

    // Register User B (Org B)
    res = await request(app).post('/api/v1/auth/register').send({
      name: 'User B', email: emailB, password: 'password', organizationName: 'Org B'
    });
    sessionB = res.headers['set-cookie'][0].split(';')[0];
    orgBId = res.body.data.organizations[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [emailA, emailB]);
    await pool.end();
  });

  it('User A should create a business in Org A', async () => {
    const res = await request(app)
      .post(`/api/v1/organizations/${orgAId}/businesses`)
      .set('Cookie', sessionA)
      .send({
        name: 'Business A',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Business A');
    businessAId = res.body.data.id;
  });

  it('User B should not be able to list businesses in Org A (Tenant Isolation)', async () => {
    const res = await request(app)
      .get(`/api/v1/organizations/${orgAId}/businesses`)
      .set('Cookie', sessionB);
    expect(res.status).toBe(403); // Forbidden, user not in org A
  });

  it('User B should not be able to fetch Business A via direct route', async () => {
    const res = await request(app)
      .get(`/api/v1/organizations/${orgAId}/businesses/${businessAId}`)
      .set('Cookie', sessionB);
    expect(res.status).toBe(403);
  });
  
  it('User A should not be able to create business in Org B', async () => {
    const res = await request(app)
      .post(`/api/v1/organizations/${orgBId}/businesses`)
      .set('Cookie', sessionA)
      .send({
        name: 'Malicious Business',
      });
    expect(res.status).toBe(403);
  });
});
