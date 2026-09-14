"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMemberRoleSchema = exports.addMemberSchema = void 0;
const zod_1 = require("zod");
const roles_1 = require("../../utils/roles");
exports.addMemberSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address").transform(e => e.toLowerCase()),
        role: zod_1.z.enum([roles_1.ROLES.OWNER, roles_1.ROLES.ADMIN, roles_1.ROLES.MEMBER, roles_1.ROLES.VIEWER])
    })
});
exports.updateMemberRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum([roles_1.ROLES.OWNER, roles_1.ROLES.ADMIN, roles_1.ROLES.MEMBER, roles_1.ROLES.VIEWER])
    })
});
