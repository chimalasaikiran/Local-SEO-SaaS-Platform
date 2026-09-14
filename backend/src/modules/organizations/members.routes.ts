import { Router } from 'express';
import { getMembers, addMember, updateMemberRole, removeMember } from './members.controller';
import { requireOrganizationPermission } from '../../middlewares/authorization.middleware';
import { validateRequest } from '../../middlewares/validation.middleware';
import { addMemberSchema, updateMemberRoleSchema } from './members.schema';

// This router is mounted under /api/v1/organizations/:organizationId/members
const router = Router({ mergeParams: true });

router.get('/', requireOrganizationPermission('members.read'), getMembers);
router.post('/', requireOrganizationPermission('members.create'), validateRequest(addMemberSchema), addMember);
router.patch('/:memberId', requireOrganizationPermission('members.update'), validateRequest(updateMemberRoleSchema), updateMemberRole);
router.delete('/:memberId', requireOrganizationPermission('members.delete'), removeMember);

export { router as membersRouter };
