"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateKeywordLocationSchema = exports.ListKeywordsQuerySchema = exports.UpdateKeywordSchema = exports.BulkCreateKeywordsSchema = exports.CreateKeywordSchema = exports.DeviceEnum = exports.SearchEngineEnum = exports.KeywordStatusEnum = void 0;
const zod_1 = require("zod");
exports.KeywordStatusEnum = zod_1.z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']);
exports.SearchEngineEnum = zod_1.z.enum(['GOOGLE']);
exports.DeviceEnum = zod_1.z.enum(['DESKTOP', 'MOBILE']);
exports.CreateKeywordSchema = zod_1.z.object({
    businessId: zod_1.z.string().uuid('Invalid Business ID'),
    locationId: zod_1.z.string().uuid('Invalid Location ID'),
    keyword: zod_1.z.string().min(1, 'Keyword is required').max(255, 'Keyword is too long'),
    searchEngine: exports.SearchEngineEnum.default('GOOGLE'),
    countryCode: zod_1.z.string().length(2, 'Country code must be 2 characters').default('IN'),
    languageCode: zod_1.z.string().min(2).max(5).default('en'),
    device: exports.DeviceEnum.default('DESKTOP')
});
exports.BulkCreateKeywordsSchema = zod_1.z.object({
    businessId: zod_1.z.string().uuid('Invalid Business ID'),
    locationId: zod_1.z.string().uuid('Invalid Location ID'),
    keywords: zod_1.z.array(zod_1.z.string().min(1).max(255)).min(1, 'At least one keyword is required'),
    searchEngine: exports.SearchEngineEnum.default('GOOGLE'),
    countryCode: zod_1.z.string().length(2).default('IN'),
    languageCode: zod_1.z.string().min(2).max(5).default('en'),
    device: exports.DeviceEnum.default('DESKTOP')
});
exports.UpdateKeywordSchema = zod_1.z.object({
    keyword: zod_1.z.string().min(1).max(255).optional(),
    searchEngine: exports.SearchEngineEnum.optional(),
    countryCode: zod_1.z.string().length(2).optional(),
    languageCode: zod_1.z.string().min(2).max(5).optional(),
    device: exports.DeviceEnum.optional(),
    status: exports.KeywordStatusEnum.optional()
});
exports.ListKeywordsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(500).optional().default(25),
    search: zod_1.z.string().optional(),
    businessId: zod_1.z.string().uuid().optional(),
    locationId: zod_1.z.string().uuid().optional(),
    status: exports.KeywordStatusEnum.optional(),
    searchEngine: exports.SearchEngineEnum.optional(),
    device: exports.DeviceEnum.optional()
});
exports.CreateKeywordLocationSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    radiusMeters: zod_1.z.number().int().min(1).optional().nullable(),
    label: zod_1.z.string().max(255).optional().nullable()
});
