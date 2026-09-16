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
    'location.read': 'location.read',
    'location.create': 'location.create',
    'location.update': 'location.update',
    'location.delete': 'location.delete',
    'keyword.read': 'keyword.read',
    'keyword.create': 'keyword.create',
    'keyword.update': 'keyword.update',
    'keyword.delete': 'keyword.delete',
    'ranking.read': 'ranking.read',
    'ranking.create': 'ranking.create',
    'ranking.update': 'ranking.update',
    'ranking.delete': 'ranking.delete',
    'ranking.run': 'ranking.run',
    'review.read': 'review.read',
    'review.reply': 'review.reply',
    'report.read': 'report.read',
    'report.create': 'report.create',
    // Geo & Competitors
    'geo.read': 'geo.read',
    'geo.search': 'geo.search',
    'competitor.read': 'competitor.read',
    'competitor.create': 'competitor.create',
    'competitor.update': 'competitor.update',
    'competitor.delete': 'competitor.delete',
    'competitor.discover': 'competitor.discover',
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
        exports.PERMISSIONS['location.read'],
        exports.PERMISSIONS['location.create'],
        exports.PERMISSIONS['location.update'],
        exports.PERMISSIONS['location.delete'],
        exports.PERMISSIONS['keyword.read'],
        exports.PERMISSIONS['keyword.create'],
        exports.PERMISSIONS['keyword.update'],
        exports.PERMISSIONS['keyword.delete'],
        exports.PERMISSIONS['ranking.read'],
        exports.PERMISSIONS['ranking.create'],
        exports.PERMISSIONS['ranking.update'],
        exports.PERMISSIONS['ranking.delete'],
        exports.PERMISSIONS['ranking.run'],
        exports.PERMISSIONS['review.read'],
        exports.PERMISSIONS['review.reply'],
        exports.PERMISSIONS['report.read'],
        exports.PERMISSIONS['report.create'],
        exports.PERMISSIONS['geo.read'],
        exports.PERMISSIONS['geo.search'],
        exports.PERMISSIONS['competitor.read'],
        exports.PERMISSIONS['competitor.create'],
        exports.PERMISSIONS['competitor.update'],
        exports.PERMISSIONS['competitor.delete'],
        exports.PERMISSIONS['competitor.discover'],
    ],
    [roles_1.ROLES.MEMBER]: [
        exports.PERMISSIONS['organization.read'],
        exports.PERMISSIONS['members.read'],
        exports.PERMISSIONS['business.read'],
        exports.PERMISSIONS['business.create'],
        exports.PERMISSIONS['business.update'],
        exports.PERMISSIONS['location.read'],
        exports.PERMISSIONS['location.create'],
        exports.PERMISSIONS['location.update'],
        exports.PERMISSIONS['keyword.read'],
        exports.PERMISSIONS['keyword.create'],
        exports.PERMISSIONS['keyword.update'],
        exports.PERMISSIONS['ranking.read'],
        exports.PERMISSIONS['ranking.create'],
        exports.PERMISSIONS['ranking.update'],
        exports.PERMISSIONS['ranking.run'],
        exports.PERMISSIONS['review.read'],
        exports.PERMISSIONS['review.reply'],
        exports.PERMISSIONS['report.read'],
        exports.PERMISSIONS['report.create'],
        exports.PERMISSIONS['geo.read'],
        exports.PERMISSIONS['geo.search'],
        exports.PERMISSIONS['competitor.read'],
        exports.PERMISSIONS['competitor.create'],
        exports.PERMISSIONS['competitor.update'],
        exports.PERMISSIONS['competitor.discover'],
    ],
    [roles_1.ROLES.VIEWER]: [
        exports.PERMISSIONS['organization.read'],
        exports.PERMISSIONS['members.read'],
        exports.PERMISSIONS['business.read'],
        exports.PERMISSIONS['location.read'],
        exports.PERMISSIONS['keyword.read'],
        exports.PERMISSIONS['ranking.read'],
        exports.PERMISSIONS['review.read'],
        exports.PERMISSIONS['report.read'],
        exports.PERMISSIONS['geo.read'],
        exports.PERMISSIONS['geo.search'],
        exports.PERMISSIONS['competitor.read'],
    ]
};
/**
 * Checks if a specific role has a given permission
 */
function hasPermission(role, permission) {
    const permissions = exports.ROLE_PERMISSIONS[role];
    return permissions ? permissions.includes(permission) : false;
}
