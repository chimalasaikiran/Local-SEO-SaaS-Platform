"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
const roles_1 = require("./roles");
exports.PERMISSIONS = {
    // Organization
    'organization.read': 'organization.read',
    'organization.update': 'organization.update',
    // Members
    'members.read': 'members.read',
    'members.create': 'members.create',
    'members.update': 'members.update',
    'members.delete': 'members.delete',
    // SEO Features (Placeholders for future)
    'business.read': 'business.read',
    'business.create': 'business.create',
    'business.update': 'business.update',
    'business.delete': 'business.delete',
    'ranking.read': 'ranking.read',
    'ranking.create': 'ranking.create',
    'review.read': 'review.read',
    'review.reply': 'review.reply',
    'report.read': 'report.read',
    'report.create': 'report.create',
};
// Map roles to their specific permissions
exports.ROLE_PERMISSIONS = {
    [roles_1.ROLES.OWNER]: Object.values(exports.PERMISSIONS), // Owner has all permissions
    [roles_1.ROLES.ADMIN]: [
        exports.PERMISSIONS['organization.read'],
        exports.PERMISSIONS['organization.update'],
        exports.PERMISSIONS['members.read'],
        exports.PERMISSIONS['members.create'],
        exports.PERMISSIONS['members.update'],
        exports.PERMISSIONS['members.delete'],
        exports.PERMISSIONS['business.read'],
        exports.PERMISSIONS['business.create'],
        exports.PERMISSIONS['business.update'],
        exports.PERMISSIONS['business.delete'],
        exports.PERMISSIONS['ranking.read'],
        exports.PERMISSIONS['ranking.create'],
        exports.PERMISSIONS['review.read'],
        exports.PERMISSIONS['review.reply'],
        exports.PERMISSIONS['report.read'],
        exports.PERMISSIONS['report.create'],
    ],
    [roles_1.ROLES.MEMBER]: [
        exports.PERMISSIONS['organization.read'],
        exports.PERMISSIONS['members.read'],
        exports.PERMISSIONS['business.read'],
        exports.PERMISSIONS['business.create'],
        exports.PERMISSIONS['business.update'],
        exports.PERMISSIONS['ranking.read'],
        exports.PERMISSIONS['ranking.create'],
        exports.PERMISSIONS['review.read'],
        exports.PERMISSIONS['review.reply'],
        exports.PERMISSIONS['report.read'],
        exports.PERMISSIONS['report.create'],
    ],
    [roles_1.ROLES.VIEWER]: [
        exports.PERMISSIONS['organization.read'],
        exports.PERMISSIONS['members.read'],
        exports.PERMISSIONS['business.read'],
        exports.PERMISSIONS['ranking.read'],
        exports.PERMISSIONS['review.read'],
        exports.PERMISSIONS['report.read'],
    ]
};
/**
 * Checks if a specific role has a given permission
 */
function hasPermission(role, permission) {
    const permissions = exports.ROLE_PERMISSIONS[role];
    return permissions ? permissions.includes(permission) : false;
}
