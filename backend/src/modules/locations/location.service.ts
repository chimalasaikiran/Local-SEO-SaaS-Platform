import { LocationRepository } from './location.repository';
import { CreateLocationInput, UpdateLocationInput, ListLocationsQuery } from './location.schema';
import { BusinessRepository } from '../businesses/business.repository';

export class LocationService {
  static async listLocations(organizationId: string, query: ListLocationsQuery) {
    return LocationRepository.list(organizationId, query);
  }

  static async getLocationById(organizationId: string, locationId: string) {
    return LocationRepository.findById(organizationId, locationId);
  }

  static async createLocation(organizationId: string, businessId: string, payload: CreateLocationInput) {
    // Verify business exists and belongs to organization
    const business = await BusinessRepository.findById(organizationId, businessId);
    if (!business) {
      throw new Error('BUSINESS_NOT_FOUND');
    }

    return LocationRepository.create(organizationId, businessId, payload);
  }

  static async updateLocation(organizationId: string, locationId: string, payload: UpdateLocationInput) {
    return LocationRepository.update(organizationId, locationId, payload);
  }

  static async archiveLocation(organizationId: string, locationId: string) {
    return LocationRepository.update(organizationId, locationId, { status: 'ARCHIVED' });
  }
}
