import { Router } from 'express';
import { LocationController } from './location.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireOrganizationPermission } from '../../middlewares/authorization.middleware';

const router = Router({ mergeParams: true });

// This router handles two sets of paths:
// 1. Nested under businesses: /api/v1/organizations/:organizationId/businesses/:businessId/locations
// 2. Direct location access: /api/v1/organizations/:organizationId/locations

router.use(requireAuth);

// These will be mounted at:
// app.use('/api/v1/organizations/:organizationId/locations', locationRoutes);
// app.use('/api/v1/organizations/:organizationId/businesses/:businessId/locations', locationRoutes);

router.get(
  '/',
  requireOrganizationPermission('location.read'),
  LocationController.list
);

router.post(
  '/',
  requireOrganizationPermission('location.create'),
  LocationController.create
);

router.get(
  '/:locationId',
  requireOrganizationPermission('location.read'),
  LocationController.getById
);

router.patch(
  '/:locationId',
  requireOrganizationPermission('location.update'),
  LocationController.update
);

router.delete(
  '/:locationId',
  requireOrganizationPermission('location.delete'),
  LocationController.archive
);

export const locationRoutes = router;
