"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessRoutes = void 0;
const express_1 = require("express");
const business_controller_1 = require("./business.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorization_middleware_1 = require("../../middlewares/authorization.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
// Assuming this router is mounted at /api/v1/organizations/:organizationId/businesses
// WAIT! The requirements said:
// GET /api/v1/businesses
// POST /api/v1/businesses
// But it also said: "Never trust organizationId from frontend. Use current authenticated organization context."
// Since the current structure probably mounts things globally, wait.
// Let me double check if the requirements meant mounting at /api/v1/businesses.
// "The server must determine the organization from the authenticated organization context. If an organizationId is included for routing/context, still verify membership and never trust it blindly."
// Let's use the explicit organization route /api/v1/organizations/:organizationId/businesses for consistency with the authorization middleware `requireOrganizationPermission`.
// Wait, the authorization middleware `requireOrganizationPermission` expects `req.params.organizationId`.
// So the routes should be under `/api/v1/organizations/:organizationId/businesses`.
// Let's verify this in the frontend or instructions. "GET /api/v1/businesses" - it says that, but "Use current authenticated organization." "If an organizationId is included for routing...". I'll mount them at `/api/v1/organizations/:organizationId/businesses` to be consistent with the existing middleware.
router.use(auth_middleware_1.requireAuth);
router.get('/', (0, authorization_middleware_1.requireOrganizationPermission)('business.read'), business_controller_1.BusinessController.list);
router.post('/', (0, authorization_middleware_1.requireOrganizationPermission)('business.create'), business_controller_1.BusinessController.create);
router.get('/:businessId', (0, authorization_middleware_1.requireOrganizationPermission)('business.read'), business_controller_1.BusinessController.getById);
router.patch('/:businessId', (0, authorization_middleware_1.requireOrganizationPermission)('business.update'), business_controller_1.BusinessController.update);
router.delete('/:businessId', (0, authorization_middleware_1.requireOrganizationPermission)('business.delete'), business_controller_1.BusinessController.archive);
exports.businessRoutes = router;
