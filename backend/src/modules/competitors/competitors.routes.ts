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

router.post(
  '/:competitorId/track', 
  requireOrganizationPermission('competitor.update'), 
  CompetitorsController.track
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

export { router as competitorsRoutes };
