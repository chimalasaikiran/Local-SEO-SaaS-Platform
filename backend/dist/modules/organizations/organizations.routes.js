"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationsRouter = void 0;
const express_1 = require("express");
const organizations_controller_1 = require("./organizations.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorization_middleware_1 = require("../../middlewares/authorization.middleware");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const organizations_schema_1 = require("./organizations.schema");
const members_routes_1 = require("./members.routes");
const router = (0, express_1.Router)();
exports.organizationsRouter = router;
router.use(auth_middleware_1.requireAuth);
router.get('/', organizations_controller_1.getOrganizations);
router.get('/:organizationId', (0, authorization_middleware_1.requireOrganizationPermission)('organization.read'), organizations_controller_1.getOrganization);
router.patch('/:organizationId', (0, authorization_middleware_1.requireOrganizationPermission)('organization.update'), (0, validation_middleware_1.validateRequest)(organizations_schema_1.updateOrganizationSchema), organizations_controller_1.updateOrganization);
// Mount members routes under /organizations/:organizationId/members
router.use('/:organizationId/members', members_routes_1.membersRouter);
