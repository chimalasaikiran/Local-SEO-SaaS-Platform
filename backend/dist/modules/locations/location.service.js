"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const location_repository_1 = require("./location.repository");
const business_repository_1 = require("../businesses/business.repository");
class LocationService {
    static async listLocations(organizationId, query) {
        return location_repository_1.LocationRepository.list(organizationId, query);
    }
    static async getLocationById(organizationId, locationId) {
        return location_repository_1.LocationRepository.findById(organizationId, locationId);
    }
    static async createLocation(organizationId, businessId, payload) {
        // Verify business exists and belongs to organization
        const business = await business_repository_1.BusinessRepository.findById(organizationId, businessId);
        if (!business) {
            throw new Error('BUSINESS_NOT_FOUND');
        }
        return location_repository_1.LocationRepository.create(organizationId, businessId, payload);
    }
    static async updateLocation(organizationId, locationId, payload) {
        return location_repository_1.LocationRepository.update(organizationId, locationId, payload);
    }
    static async archiveLocation(organizationId, locationId) {
        return location_repository_1.LocationRepository.update(organizationId, locationId, { status: 'ARCHIVED' });
    }
}
exports.LocationService = LocationService;
