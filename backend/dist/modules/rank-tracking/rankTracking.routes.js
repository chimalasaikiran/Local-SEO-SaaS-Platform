"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rankTracking_controller_1 = require("./rankTracking.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorization_middleware_1 = require("../../middlewares/authorization.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
// All routes require auth
router.use(auth_middleware_1.requireAuth);
// Providers
router.get('/providers/status', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.read'), rankTracking_controller_1.RankTrackingController.getProviderStatus);
// Configs
router.post('/configs', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.create'), rankTracking_controller_1.RankTrackingController.createConfig);
router.get('/configs', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.read'), rankTracking_controller_1.RankTrackingController.getConfigs);
router.get('/configs/:configId', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.read'), rankTracking_controller_1.RankTrackingController.getConfigById);
router.patch('/configs/:configId', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.update'), rankTracking_controller_1.RankTrackingController.updateConfig);
router.delete('/configs/:configId', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.delete'), rankTracking_controller_1.RankTrackingController.deleteConfig);
// Keywords
router.get('/configs/:configId/keywords', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.read'), rankTracking_controller_1.RankTrackingController.getKeywords);
router.post('/configs/:configId/keywords', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.update'), rankTracking_controller_1.RankTrackingController.addKeyword);
router.delete('/configs/:configId/keywords/:keywordId', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.update'), rankTracking_controller_1.RankTrackingController.removeKeyword);
// Grid
router.get('/configs/:configId/grid', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.read'), rankTracking_controller_1.RankTrackingController.getGrid);
router.post('/configs/:configId/grid/regenerate', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.update'), rankTracking_controller_1.RankTrackingController.regenerateGrid);
// Runs
router.post('/configs/:configId/runs', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.run'), rankTracking_controller_1.RankTrackingController.createRun);
router.get('/configs/:configId/history', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.read'), rankTracking_controller_1.RankTrackingController.getRunsHistory);
router.get('/runs/:runId', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.read'), rankTracking_controller_1.RankTrackingController.getRun);
router.get('/runs/:runId/rankings', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.read'), rankTracking_controller_1.RankTrackingController.getRunRankings);
// Rankings
router.get('/configs/:configId/rankings', (0, authorization_middleware_1.requireOrganizationPermission)('ranking.read'), rankTracking_controller_1.RankTrackingController.getRankings);
exports.default = router;
