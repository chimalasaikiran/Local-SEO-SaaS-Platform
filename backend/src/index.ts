/// <reference path="./types/express/index.d.ts" />
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { errorHandler } from './middlewares/errorHandler';
import cookieParser from 'cookie-parser';
import { authRouter } from './modules/auth/auth.routes';
import { organizationsRouter } from './modules/organizations/organizations.routes';
import { businessRoutes } from './modules/businesses/business.routes';
import { locationRoutes } from './modules/locations/location.routes';
import { keywordRoutes } from './modules/keywords/keyword.routes';
import rankTrackingRouter from './modules/rank-tracking/rankTracking.routes';
import { geoRoutes } from './modules/geo/geo.routes';
import { competitorsRoutes } from './modules/competitors/competitors.routes';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/organizations', organizationsRouter);
app.use('/api/v1/organizations/:organizationId/businesses', businessRoutes);
app.use('/api/v1/organizations/:organizationId/locations', locationRoutes);
app.use('/api/v1/organizations/:organizationId/businesses/:businessId/locations', locationRoutes);
app.use('/api/v1/organizations/:organizationId/keywords', keywordRoutes);
app.use('/api/v1/organizations/:organizationId/rank-tracking', rankTrackingRouter);
app.use('/api/v1/geo', geoRoutes);
app.use('/api/v1/organizations/:organizationId/competitors', competitorsRoutes);

// Error handling
app.use(errorHandler);

import { checkDbConnection } from './config/db';

app.listen(port, async () => {
  console.log(`[Backend] Server running on port ${port}`);

  // Verify Database Connection
  const dbConnected = await checkDbConnection();
  if (dbConnected) {
    console.log('[Backend] Successfully connected to PostgreSQL Database');
  } else {
    console.log('[Backend] Failed to connect to PostgreSQL Database');
  }
});
