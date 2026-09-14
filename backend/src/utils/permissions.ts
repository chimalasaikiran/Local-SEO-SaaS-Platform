import { Role, ROLES } from './roles';

export const PERMISSIONS = {
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
  
  'ranking.read': 'ranking.read',
  'ranking.create': 'ranking.create',
  
  'review.read': 'review.read',
  'review.reply': 'review.reply',
  
  'report.read': 'report.read',
  'report.create': 'report.create',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Map roles to their specific permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.OWNER]: Object.values(PERMISSIONS), // Owner has all permissions
  [ROLES.ADMIN]: [
    PERMISSIONS['organization.read'],
    PERMISSIONS['organization.update'],
    PERMISSIONS['members.read'],
    PERMISSIONS['members.create'],
    PERMISSIONS['members.update'],
    PERMISSIONS['members.delete'],
    PERMISSIONS['business.read'],
    PERMISSIONS['business.create'],
    PERMISSIONS['business.update'],
    PERMISSIONS['business.delete'],
    PERMISSIONS['location.read'],
    PERMISSIONS['location.create'],
    PERMISSIONS['location.update'],
    PERMISSIONS['location.delete'],
    PERMISSIONS['ranking.read'],
    PERMISSIONS['ranking.create'],
    PERMISSIONS['review.read'],
    PERMISSIONS['review.reply'],
    PERMISSIONS['report.read'],
    PERMISSIONS['report.create'],
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS['organization.read'],
    PERMISSIONS['members.read'],
    PERMISSIONS['business.read'],
    PERMISSIONS['business.create'],
    PERMISSIONS['business.update'],
    PERMISSIONS['location.read'],
    PERMISSIONS['location.create'],
    PERMISSIONS['location.update'],
    PERMISSIONS['ranking.read'],
    PERMISSIONS['ranking.create'],
    PERMISSIONS['review.read'],
    PERMISSIONS['review.reply'],
    PERMISSIONS['report.read'],
    PERMISSIONS['report.create'],
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS['organization.read'],
    PERMISSIONS['members.read'],
    PERMISSIONS['business.read'],
    PERMISSIONS['location.read'],
    PERMISSIONS['ranking.read'],
    PERMISSIONS['review.read'],
    PERMISSIONS['report.read'],
  ]
};

/**
 * Checks if a specific role has a given permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}
