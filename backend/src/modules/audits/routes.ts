import { Router } from 'express';
import { auditController } from './controllers/auditController';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireOrganizationPermission } from '../../middlewares/authorization.middleware';

const router = Router({ mergeParams: true });

// Apply auth middleware to all audit routes
router.use(requireAuth);
router.use(requireOrganizationPermission());

router.get('/', auditController.listAudits);
router.post('/', auditController.createAudit);
router.get('/:id', auditController.getAudit);
router.get('/:id/pages', auditController.getPages);
router.get('/:id/issues', auditController.getIssues);
router.patch('/:id/issues/:issueId', auditController.updateIssue);

export default router;
