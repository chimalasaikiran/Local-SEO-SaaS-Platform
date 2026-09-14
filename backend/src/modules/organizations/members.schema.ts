import { z } from 'zod';
import { ROLES } from '../../utils/roles';

export const addMemberSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").transform(e => e.toLowerCase()),
    role: z.enum([ROLES.OWNER, ROLES.ADMIN, ROLES.MEMBER, ROLES.VIEWER])
  })
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum([ROLES.OWNER, ROLES.ADMIN, ROLES.MEMBER, ROLES.VIEWER])
  })
});
