"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationController = void 0;
const location_service_1 = require("./location.service");
const location_schema_1 = require("./location.schema");
const zod_1 = require("zod");
class LocationController {
    static async list(req, res, next) {
        try {
            const organizationId = req.organizationMembership?.organizationId;
            if (!organizationId) {
                return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
            }
            // Check if businessId is provided in params (for nested route)
            const businessId = req.params.businessId;
            const queryParams = location_schema_1.ListLocationsQuerySchema.parse({
                ...req.query,
                ...(businessId ? { businessId } : {})
            });
            const result = await location_service_1.LocationService.listLocations(organizationId, queryParams);
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.issues } });
            }
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const organizationId = req.organizationMembership?.organizationId;
            if (!organizationId) {
                return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
            }
            const { businessId } = req.params;
            if (!businessId) {
                return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Business ID is required' } });
            }
            const payload = location_schema_1.CreateLocationSchema.parse(req.body);
            const location = await location_service_1.LocationService.createLocation(organizationId, businessId, payload);
            return res.status(201).json({ success: true, data: location });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
            }
            if (error.message === 'BUSINESS_NOT_FOUND') {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Business not found or belongs to another organization' } });
            }
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const organizationId = req.organizationMembership?.organizationId;
            if (!organizationId) {
                return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
            }
            const { locationId } = req.params;
            const location = await location_service_1.LocationService.getLocationById(organizationId, locationId);
            if (!location) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } });
            }
            return res.status(200).json({ success: true, data: location });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const organizationId = req.organizationMembership?.organizationId;
            if (!organizationId) {
                return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
            }
            const { locationId } = req.params;
            const payload = location_schema_1.UpdateLocationSchema.parse(req.body);
            const location = await location_service_1.LocationService.updateLocation(organizationId, locationId, payload);
            if (!location) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } });
            }
            return res.status(200).json({ success: true, data: location });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
            }
            next(error);
        }
    }
    static async archive(req, res, next) {
        try {
            const organizationId = req.organizationMembership?.organizationId;
            if (!organizationId) {
                return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
            }
            const { locationId } = req.params;
            const location = await location_service_1.LocationService.archiveLocation(organizationId, locationId);
            if (!location) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } });
            }
            return res.status(200).json({ success: true, data: location });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LocationController = LocationController;
