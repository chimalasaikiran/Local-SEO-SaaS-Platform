import { BusinessRepository } from './business.repository';
import { CreateBusinessInput, UpdateBusinessInput, ListBusinessesQuery } from './business.schema';

export class BusinessService {
  static async listBusinesses(organizationId: string, query: ListBusinessesQuery) {
    return BusinessRepository.list(organizationId, query);
  }

  static async getBusinessById(organizationId: string, businessId: string) {
    return BusinessRepository.findById(organizationId, businessId);
  }

  static async createBusiness(organizationId: string, payload: CreateBusinessInput) {
    // Generate base slug
    let baseSlug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let suffix = 1;

    // Ensure uniqueness within organization
    while (await BusinessRepository.findBySlug(organizationId, slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    return BusinessRepository.create(organizationId, slug, payload);
  }

  static async updateBusiness(organizationId: string, businessId: string, payload: UpdateBusinessInput) {
    // Slug generation on name change is omitted by default to ensure existing URLs remain stable
    // as requested by "ensure existing identifiers remain stable. Do not unexpectedly break existing URLs."
    return BusinessRepository.update(organizationId, businessId, payload);
  }

  static async archiveBusiness(organizationId: string, businessId: string) {
    return BusinessRepository.update(organizationId, businessId, { status: 'ARCHIVED' });
  }
}
