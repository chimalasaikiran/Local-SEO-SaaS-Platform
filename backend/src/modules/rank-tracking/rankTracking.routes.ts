import { Router } from 'express';
import { RankTrackingController } from './rankTracking.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireOrganizationPermission } from '../../middlewares/authorization.middleware';

const router = Router({ mergeParams: true });

// All routes require auth
router.use(requireAuth);

// Providers
router.get('/providers/status', requireOrganizationPermission('ranking.read'), RankTrackingController.getProviderStatus);

// Configs
router.post('/configs', requireOrganizationPermission('ranking.create'), RankTrackingController.createConfig);
router.get('/configs', requireOrganizationPermission('ranking.read'), RankTrackingController.getConfigs);
router.get('/configs/:configId', requireOrganizationPermission('ranking.read'), RankTrackingController.getConfigById);
router.patch('/configs/:configId', requireOrganizationPermission('ranking.update'), RankTrackingController.updateConfig);
router.delete('/configs/:configId', requireOrganizationPermission('ranking.delete'), RankTrackingController.deleteConfig);

// Keywords
router.get('/configs/:configId/keywords', requireOrganizationPermission('ranking.read'), RankTrackingController.getKeywords);
router.post('/configs/:configId/keywords', requireOrganizationPermission('ranking.update'), RankTrackingController.addKeyword);
router.delete('/configs/:configId/keywords/:keywordId', requireOrganizationPermission('ranking.update'), RankTrackingController.removeKeyword);

// Grid
router.get('/configs/:configId/grid', requireOrganizationPermission('ranking.read'), RankTrackingController.getGrid);
router.post('/configs/:configId/grid/regenerate', requireOrganizationPermission('ranking.update'), RankTrackingController.regenerateGrid);

// Runs
router.post('/configs/:configId/runs', requireOrganizationPermission('ranking.run'), RankTrackingController.createRun);
router.get('/configs/:configId/history', requireOrganizationPermission('ranking.read'), RankTrackingController.getRunsHistory);
router.get('/runs/:runId', requireOrganizationPermission('ranking.read'), RankTrackingController.getRun);
router.get('/runs/:runId/rankings', requireOrganizationPermission('ranking.read'), RankTrackingController.getRunRankings);

// Rankings
router.get('/configs/:configId/rankings', requireOrganizationPermission('ranking.read'), RankTrackingController.getRankings);

export default router;
