"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListLocationsQuerySchema = exports.UpdateLocationSchema = exports.CreateLocationSchema = exports.LocationStatusEnum = void 0;
const zod_1 = require("zod");
exports.LocationStatusEnum = zod_1.z.enum(['ACTIVE', 'ARCHIVED']);
exports.CreateLocationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    addressLine1: zod_1.z.string().min(1, 'Address Line 1 is required'),
    addressLine2: zod_1.z.string().optional().or(zod_1.z.literal('')),
    city: zod_1.z.string().min(1, 'City is required'),
    state: zod_1.z.string().optional().or(zod_1.z.literal('')),
    postalCode: zod_1.z.string().optional().or(zod_1.z.literal('')),
    country: zod_1.z.string().min(1, 'Country is required'),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
    timezone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    websiteUrl: zod_1.z.string().url('Invalid URL').optional().or(zod_1.z.literal(''))
});
exports.UpdateLocationSchema = exports.CreateLocationSchema.partial().extend({
    status: exports.LocationStatusEnum.optional()
});
exports.ListLocationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(20),
    search: zod_1.z.string().optional(),
    businessId: zod_1.z.string().uuid().optional(),
    status: exports.LocationStatusEnum.optional()
});
