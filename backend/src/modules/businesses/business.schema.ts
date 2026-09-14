import { z } from 'zod';

export const BusinessStatusEnum = z.enum(['ACTIVE', 'ARCHIVED']);

export const CreateBusinessSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  primaryCategory: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal(''))
});

export const UpdateBusinessSchema = CreateBusinessSchema.partial().extend({
  status: BusinessStatusEnum.optional()
});

export const ListBusinessesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: BusinessStatusEnum.optional()
});

export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof UpdateBusinessSchema>;
export type ListBusinessesQuery = z.infer<typeof ListBusinessesQuerySchema>;
