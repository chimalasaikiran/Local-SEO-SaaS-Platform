"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListBusinessesQuerySchema = exports.UpdateBusinessSchema = exports.CreateBusinessSchema = exports.BusinessStatusEnum = void 0;
const zod_1 = require("zod");
exports.BusinessStatusEnum = zod_1.z.enum(['ACTIVE', 'ARCHIVED']);
exports.CreateBusinessSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    websiteUrl: zod_1.z.string().url('Invalid URL').optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    primaryCategory: zod_1.z.string().optional().or(zod_1.z.literal('')),
    description: zod_1.z.string().optional().or(zod_1.z.literal(''))
});
exports.UpdateBusinessSchema = exports.CreateBusinessSchema.partial().extend({
    status: exports.BusinessStatusEnum.optional()
});
exports.ListBusinessesQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(20),
    search: zod_1.z.string().optional(),
    status: exports.BusinessStatusEnum.optional()
});
