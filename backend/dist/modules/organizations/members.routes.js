"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.membersRouter = void 0;
const express_1 = require("express");
const members_controller_1 = require("./members.controller");
const authorization_middleware_1 = require("../../middlewares/authorization.middleware");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const members_schema_1 = require("./members.schema");
// This router is mounted under /api/v1/organizations/:organizationId/members
const router = (0, express_1.Router)({ mergeParams: true });
exports.membersRouter = router;
router.get('/', (0, authorization_middleware_1.requireOrganizationPermission)('members.read'), members_controller_1.getMembers);
router.post('/', (0, authorization_middleware_1.requireOrganizationPermission)('members.create'), (0, validation_middleware_1.validateRequest)(members_schema_1.addMemberSchema), members_controller_1.addMember);
router.patch('/:memberId', (0, authorization_middleware_1.requireOrganizationPermission)('members.update'), (0, validation_middleware_1.validateRequest)(members_schema_1.updateMemberRoleSchema), members_controller_1.updateMemberRole);
router.delete('/:memberId', (0, authorization_middleware_1.requireOrganizationPermission)('members.delete'), members_controller_1.removeMember);
