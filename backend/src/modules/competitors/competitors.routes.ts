import { Router } from 'express';
import { CompetitorsController } from './competitors.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireOrganizationPermission } from '../../middlewares/authorization.middleware';

const router = Router({ mergeParams: true }); // mergeParams to access :organizationId

router.use(requireAuth);

router.get(
  '/', 
  requireOrganizationPermission('competitor.read'), 
  CompetitorsController.list
);

router.post(
  '/discover', 
  requireOrganizationPermission('competitor.discover'), 
  CompetitorsController.discover
);

router.get(
  '/compare',
  requireOrganizationPermission('competitor.read'),
  CompetitorsController.compare
);

router.get(
  '/:competitorId',
  requireOrganizationPermission('competitor.read'),
  CompetitorsController.getDetail
);

router.post(
  '/:competitorId/track', 
  requireOrganizationPermission('competitor.update'), 
  CompetitorsController.track
);

router.post(
  '/:competitorId/untrack', 
  requireOrganizationPermission('competitor.update'), 
  CompetitorsController.untrack
);

router.patch(
  '/:competitorId', 
  requireOrganizationPermission('competitor.update'), 
  CompetitorsController.update
);

router.delete(
  '/:competitorId', 
  requireOrganizationPermission('competitor.delete'), 
  CompetitorsController.delete
);

router.get(
  '/:competitorId/history',
  requireOrganizationPermission('competitor.read'),
  CompetitorsController.history
);

router.post(
  '/:competitorId/refresh',
  requireOrganizationPermission('competitor.update'),
  CompetitorsController.refresh
);

export { router as competitorsRoutes };
