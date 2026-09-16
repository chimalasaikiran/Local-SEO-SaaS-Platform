"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordRoutes = void 0;
const express_1 = require("express");
const keyword_controller_1 = require("./keyword.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorization_middleware_1 = require("../../middlewares/authorization.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_middleware_1.requireAuth);
// Base route: /api/v1/organizations/:organizationId/keywords
router.get('/', (0, authorization_middleware_1.requireOrganizationPermission)('keyword.read'), keyword_controller_1.KeywordController.list);
router.post('/', (0, authorization_middleware_1.requireOrganizationPermission)('keyword.create'), keyword_controller_1.KeywordController.create);
router.post('/bulk', (0, authorization_middleware_1.requireOrganizationPermission)('keyword.create'), keyword_controller_1.KeywordController.bulkCreate);
router.get('/:keywordId', (0, authorization_middleware_1.requireOrganizationPermission)('keyword.read'), keyword_controller_1.KeywordController.getById);
router.patch('/:keywordId', (0, authorization_middleware_1.requireOrganizationPermission)('keyword.update'), keyword_controller_1.KeywordController.update);
router.delete('/:keywordId', (0, authorization_middleware_1.requireOrganizationPermission)('keyword.delete'), keyword_controller_1.KeywordController.archive);
// --- Keyword Locations ---
router.get('/:keywordId/locations', (0, authorization_middleware_1.requireOrganizationPermission)('keyword.read'), keyword_controller_1.KeywordController.listLocations);
router.post('/:keywordId/locations', (0, authorization_middleware_1.requireOrganizationPermission)('keyword.create'), // require create for adding locations
keyword_controller_1.KeywordController.addLocation);
router.delete('/:keywordId/locations/:locationId', (0, authorization_middleware_1.requireOrganizationPermission)('keyword.delete'), // require delete for removing locations
keyword_controller_1.KeywordController.removeLocation);
exports.keywordRoutes = router;
