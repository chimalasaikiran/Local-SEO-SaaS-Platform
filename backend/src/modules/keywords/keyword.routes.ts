import { Router } from 'express';
import { KeywordController } from './keyword.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireOrganizationPermission } from '../../middlewares/authorization.middleware';

const router = Router({ mergeParams: true });

router.use(requireAuth);

// Base route: /api/v1/organizations/:organizationId/keywords

router.get(
  '/',
  requireOrganizationPermission('keyword.read'),
  KeywordController.list
);

router.post(
  '/',
  requireOrganizationPermission('keyword.create'),
  KeywordController.create
);

router.post(
  '/bulk',
  requireOrganizationPermission('keyword.create'),
  KeywordController.bulkCreate
);

router.get(
  '/:keywordId',
  requireOrganizationPermission('keyword.read'),
  KeywordController.getById
);

router.patch(
  '/:keywordId',
  requireOrganizationPermission('keyword.update'),
  KeywordController.update
);

router.delete(
  '/:keywordId',
  requireOrganizationPermission('keyword.delete'),
  KeywordController.archive
);

// --- Keyword Locations ---
router.get(
  '/:keywordId/locations',
  requireOrganizationPermission('keyword.read'),
  KeywordController.listLocations
);

router.post(
  '/:keywordId/locations',
  requireOrganizationPermission('keyword.create'), // require create for adding locations
  KeywordController.addLocation
);

router.delete(
  '/:keywordId/locations/:locationId',
  requireOrganizationPermission('keyword.delete'), // require delete for removing locations
  KeywordController.removeLocation
);

export const keywordRoutes = router;
