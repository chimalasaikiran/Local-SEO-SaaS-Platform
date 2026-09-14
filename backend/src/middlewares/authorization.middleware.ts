import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { Permission, hasPermission } from '../utils/permissions';
import { Role } from '../utils/roles';

export const requireOrganizationPermission = (requiredPermission?: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' }
        });
      }

      // Organization ID typically comes from the route params like /api/v1/organizations/:organizationId/...
      const organizationId = req.params.organizationId;

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Organization ID is missing in route.' }
        });
      }

      // Verify membership
      const { rows } = await pool.query(
        `SELECT role FROM organization_memberships 
         WHERE organization_id = $1 AND user_id = $2`,
        [organizationId, req.user.id]
      );

      const membership = rows[0];

      if (!membership) {
        // We return FORBIDDEN or NOT FOUND. Returning FORBIDDEN (tenant isolation).
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to access this organization.' }
        });
      }

      const role = membership.role as Role;

      if (requiredPermission && !hasPermission(role, requiredPermission)) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' }
        });
      }

      req.organizationMembership = {
        organizationId,
        role
      };

      next();
    } catch (error) {
      console.error('[AuthorizationMiddleware] Error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' }
      });
    }
  };
};
