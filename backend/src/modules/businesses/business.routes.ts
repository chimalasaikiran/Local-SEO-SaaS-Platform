import { Router } from 'express';
import { BusinessController } from './business.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireOrganizationPermission } from '../../middlewares/authorization.middleware';

const router = Router({ mergeParams: true });

// Assuming this router is mounted at /api/v1/organizations/:organizationId/businesses
// WAIT! The requirements said:
// GET /api/v1/businesses
// POST /api/v1/businesses
// But it also said: "Never trust organizationId from frontend. Use current authenticated organization context."
// Since the current structure probably mounts things globally, wait.
// Let me double check if the requirements meant mounting at /api/v1/businesses.
// "The server must determine the organization from the authenticated organization context. If an organizationId is included for routing/context, still verify membership and never trust it blindly."
// Let's use the explicit organization route /api/v1/organizations/:organizationId/businesses for consistency with the authorization middleware `requireOrganizationPermission`.
// Wait, the authorization middleware `requireOrganizationPermission` expects `req.params.organizationId`.
// So the routes should be under `/api/v1/organizations/:organizationId/businesses`.
// Let's verify this in the frontend or instructions. "GET /api/v1/businesses" - it says that, but "Use current authenticated organization." "If an organizationId is included for routing...". I'll mount them at `/api/v1/organizations/:organizationId/businesses` to be consistent with the existing middleware.

router.use(requireAuth);

router.get(
  '/',
  requireOrganizationPermission('business.read'),
  BusinessController.list
);

router.post(
  '/',
  requireOrganizationPermission('business.create'),
  BusinessController.create
);

router.get(
  '/:businessId',
  requireOrganizationPermission('business.read'),
  BusinessController.getById
);

router.patch(
  '/:businessId',
  requireOrganizationPermission('business.update'),
  BusinessController.update
);

router.delete(
  '/:businessId',
  requireOrganizationPermission('business.delete'),
  BusinessController.archive
);

export const businessRoutes = router;
