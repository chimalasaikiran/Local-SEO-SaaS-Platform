import { Router } from 'express';
import { getOrganizations, getOrganization, updateOrganization } from './organizations.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireOrganizationPermission } from '../../middlewares/authorization.middleware';
import { validateRequest } from '../../middlewares/validation.middleware';
import { updateOrganizationSchema } from './organizations.schema';
import { membersRouter } from './members.routes';

const router = Router();

router.use(requireAuth);

router.get('/', getOrganizations);
router.get('/:organizationId', requireOrganizationPermission('organization.read'), getOrganization);
router.patch('/:organizationId', requireOrganizationPermission('organization.update'), validateRequest(updateOrganizationSchema), updateOrganization);

// Mount members routes under /organizations/:organizationId/members
router.use('/:organizationId/members', membersRouter);

export { router as organizationsRouter };
