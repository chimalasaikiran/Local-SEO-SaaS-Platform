import { z } from 'zod';

export const KeywordStatusEnum = z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']);
export const SearchEngineEnum = z.enum(['GOOGLE']);
export const DeviceEnum = z.enum(['DESKTOP', 'MOBILE']);

export const CreateKeywordSchema = z.object({
  businessId: z.string().uuid('Invalid Business ID'),
  locationId: z.string().uuid('Invalid Location ID'),
  keyword: z.string().min(1, 'Keyword is required').max(255, 'Keyword is too long'),
  searchEngine: SearchEngineEnum.default('GOOGLE'),
  countryCode: z.string().length(2, 'Country code must be 2 characters').default('IN'),
  languageCode: z.string().min(2).max(5).default('en'),
  device: DeviceEnum.default('DESKTOP')
});

export const BulkCreateKeywordsSchema = z.object({
  businessId: z.string().uuid('Invalid Business ID'),
  locationId: z.string().uuid('Invalid Location ID'),
  keywords: z.array(z.string().min(1).max(255)).min(1, 'At least one keyword is required'),
  searchEngine: SearchEngineEnum.default('GOOGLE'),
  countryCode: z.string().length(2).default('IN'),
  languageCode: z.string().min(2).max(5).default('en'),
  device: DeviceEnum.default('DESKTOP')
});

export const UpdateKeywordSchema = z.object({
  keyword: z.string().min(1).max(255).optional(),
  searchEngine: SearchEngineEnum.optional(),
  countryCode: z.string().length(2).optional(),
  languageCode: z.string().min(2).max(5).optional(),
  device: DeviceEnum.optional(),
  status: KeywordStatusEnum.optional()
});

export const ListKeywordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  search: z.string().optional(),
  businessId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  status: KeywordStatusEnum.optional(),
  searchEngine: SearchEngineEnum.optional(),
  device: DeviceEnum.optional()
});

export const CreateKeywordLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(1).optional().nullable(),
  label: z.string().max(255).optional().nullable()
});

export type CreateKeywordInput = z.infer<typeof CreateKeywordSchema>;
export type BulkCreateKeywordsInput = z.infer<typeof BulkCreateKeywordsSchema>;
export type UpdateKeywordInput = z.infer<typeof UpdateKeywordSchema>;
export type ListKeywordsQuery = z.infer<typeof ListKeywordsQuerySchema>;
export type CreateKeywordLocationInput = z.infer<typeof CreateKeywordLocationSchema>;
