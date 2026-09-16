"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.competitorsRoutes = void 0;
const express_1 = require("express");
const competitors_controller_1 = require("./competitors.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorization_middleware_1 = require("../../middlewares/authorization.middleware");
const router = (0, express_1.Router)({ mergeParams: true }); // mergeParams to access :organizationId
exports.competitorsRoutes = router;
router.use(auth_middleware_1.requireAuth);
router.get('/', (0, authorization_middleware_1.requireOrganizationPermission)('competitor.read'), competitors_controller_1.CompetitorsController.list);
router.post('/discover', (0, authorization_middleware_1.requireOrganizationPermission)('competitor.discover'), competitors_controller_1.CompetitorsController.discover);
router.post('/:competitorId/track', (0, authorization_middleware_1.requireOrganizationPermission)('competitor.update'), competitors_controller_1.CompetitorsController.track);
router.patch('/:competitorId', (0, authorization_middleware_1.requireOrganizationPermission)('competitor.update'), competitors_controller_1.CompetitorsController.update);
router.delete('/:competitorId', (0, authorization_middleware_1.requireOrganizationPermission)('competitor.delete'), competitors_controller_1.CompetitorsController.delete);
