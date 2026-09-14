import { z } from 'zod';

export const LocationStatusEnum = z.enum(['ACTIVE', 'ARCHIVED']);

export const CreateLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  addressLine1: z.string().min(1, 'Address Line 1 is required'),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  country: z.string().min(1, 'Country is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal(''))
});

export const UpdateLocationSchema = CreateLocationSchema.partial().extend({
  status: LocationStatusEnum.optional()
});

export const ListLocationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  businessId: z.string().uuid().optional(),
  status: LocationStatusEnum.optional()
});

export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>;
export type ListLocationsQuery = z.infer<typeof ListLocationsQuerySchema>;
