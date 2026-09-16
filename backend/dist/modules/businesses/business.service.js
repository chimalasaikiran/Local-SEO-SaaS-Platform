"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessService = void 0;
const business_repository_1 = require("./business.repository");
class BusinessService {
    static async listBusinesses(organizationId, query) {
        return business_repository_1.BusinessRepository.list(organizationId, query);
    }
    static async getBusinessById(organizationId, businessId) {
        return business_repository_1.BusinessRepository.findById(organizationId, businessId);
    }
    static async createBusiness(organizationId, payload) {
        // Generate base slug
        let baseSlug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let slug = baseSlug;
        let suffix = 1;
        // Ensure uniqueness within organization
        while (await business_repository_1.BusinessRepository.findBySlug(organizationId, slug)) {
            slug = `${baseSlug}-${suffix}`;
            suffix++;
        }
        return business_repository_1.BusinessRepository.create(organizationId, slug, payload);
    }
    static async updateBusiness(organizationId, businessId, payload) {
        // Slug generation on name change is omitted by default to ensure existing URLs remain stable
        // as requested by "ensure existing identifiers remain stable. Do not unexpectedly break existing URLs."
        return business_repository_1.BusinessRepository.update(organizationId, businessId, payload);
    }
    static async archiveBusiness(organizationId, businessId) {
        return business_repository_1.BusinessRepository.update(organizationId, businessId, { status: 'ARCHIVED' });
    }
}
exports.BusinessService = BusinessService;
