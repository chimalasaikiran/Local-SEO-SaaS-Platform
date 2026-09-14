import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100)
  })
});
