export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Hierarchy for role-based comparisons (higher number = more privileges)
export const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 40,
  ADMIN: 30,
  MEMBER: 20,
  VIEWER: 10
};

/**
 * Checks if a user's role is greater than or equal to the required role
 */
export function hasRoleOrHigher(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
