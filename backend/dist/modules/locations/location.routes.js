"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationRoutes = void 0;
const express_1 = require("express");
const location_controller_1 = require("./location.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorization_middleware_1 = require("../../middlewares/authorization.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
// This router handles two sets of paths:
// 1. Nested under businesses: /api/v1/organizations/:organizationId/businesses/:businessId/locations
// 2. Direct location access: /api/v1/organizations/:organizationId/locations
router.use(auth_middleware_1.requireAuth);
// These will be mounted at:
// app.use('/api/v1/organizations/:organizationId/locations', locationRoutes);
// app.use('/api/v1/organizations/:organizationId/businesses/:businessId/locations', locationRoutes);
router.get('/', (0, authorization_middleware_1.requireOrganizationPermission)('location.read'), location_controller_1.LocationController.list);
router.post('/', (0, authorization_middleware_1.requireOrganizationPermission)('location.create'), location_controller_1.LocationController.create);
router.get('/:locationId', (0, authorization_middleware_1.requireOrganizationPermission)('location.read'), location_controller_1.LocationController.getById);
router.patch('/:locationId', (0, authorization_middleware_1.requireOrganizationPermission)('location.update'), location_controller_1.LocationController.update);
router.delete('/:locationId', (0, authorization_middleware_1.requireOrganizationPermission)('location.delete'), location_controller_1.LocationController.archive);
exports.locationRoutes = router;
