import { Role } from '../../utils/roles';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        sessionId: string;
      };
      // Populated by authorization middleware
      organizationMembership?: {
        organizationId: string;
        role: Role;
      };
    }
  }
}
