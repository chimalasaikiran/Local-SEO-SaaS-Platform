"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.ROLES = void 0;
exports.hasRoleOrHigher = hasRoleOrHigher;
exports.ROLES = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
    VIEWER: 'VIEWER'
};
// Hierarchy for role-based comparisons (higher number = more privileges)
exports.ROLE_HIERARCHY = {
    OWNER: 40,
    ADMIN: 30,
    MEMBER: 20,
    VIEWER: 10
};
/**
 * Checks if a user's role is greater than or equal to the required role
 */
function hasRoleOrHigher(userRole, requiredRole) {
    return exports.ROLE_HIERARCHY[userRole] >= exports.ROLE_HIERARCHY[requiredRole];
}
