"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordService = void 0;
const keyword_repository_1 = require("./keyword.repository");
const db_1 = __importDefault(require("../../config/db"));
class KeywordService {
    /**
     * Normalizes a keyword by lowercasing, trimming, and collapsing whitespace.
     */
    static normalizeKeyword(keyword) {
        return keyword.toLowerCase().trim().replace(/\s+/g, ' ');
    }
    static async list(organizationId, query) {
        return keyword_repository_1.KeywordRepository.list(organizationId, query);
    }
    static async getById(organizationId, keywordId) {
        const keyword = await keyword_repository_1.KeywordRepository.findById(organizationId, keywordId);
        if (!keyword) {
            throw new Error('Keyword not found');
        }
        return keyword;
    }
    static async create(organizationId, payload) {
        // Validate business and location ownership
        const validationQuery = `
      SELECT b.organization_id as b_org, l.organization_id as l_org, l.business_id as l_bus
      FROM locations l
      JOIN businesses b ON l.business_id = b.id
      WHERE l.id = $1 AND b.id = $2
    `;
        const validationResult = await db_1.default.query(validationQuery, [payload.locationId, payload.businessId]);
        if (validationResult.rows.length === 0) {
            throw new Error('Location or Business not found, or they do not match');
        }
        const { b_org, l_org } = validationResult.rows[0];
        if (b_org !== organizationId || l_org !== organizationId) {
            throw new Error('Location or Business does not belong to your organization');
        }
        const normalizedKeyword = this.normalizeKeyword(payload.keyword);
        // Check for existing active/paused duplicate
        const duplicateCheck = await db_1.default.query(`SELECT id FROM keywords 
       WHERE organization_id = $1 AND location_id = $2 AND normalized_keyword = $3 
       AND search_engine = $4 AND device = $5 AND country_code = $6 AND language_code = $7
       AND status IN ('ACTIVE', 'PAUSED')`, [
            organizationId, payload.locationId, normalizedKeyword,
            payload.searchEngine, payload.device, payload.countryCode, payload.languageCode
        ]);
        if (duplicateCheck.rows.length > 0) {
            throw new Error('Keyword with this configuration already exists for this location');
        }
        return keyword_repository_1.KeywordRepository.create(organizationId, { ...payload, normalizedKeyword });
    }
    static async bulkCreate(organizationId, payload) {
        // Validate business and location ownership
        const validationQuery = `
      SELECT b.organization_id as b_org, l.organization_id as l_org
      FROM locations l
      JOIN businesses b ON l.business_id = b.id
      WHERE l.id = $1 AND b.id = $2
    `;
        const validationResult = await db_1.default.query(validationQuery, [payload.locationId, payload.businessId]);
        if (validationResult.rows.length === 0) {
            throw new Error('Location or Business not found, or they do not match');
        }
        const { b_org, l_org } = validationResult.rows[0];
        if (b_org !== organizationId || l_org !== organizationId) {
            throw new Error('Location or Business does not belong to your organization');
        }
        // Process and normalize keywords, removing duplicates from the input
        const uniqueNormalized = new Map(); // normalized -> original
        for (const kw of payload.keywords) {
            const normalized = this.normalizeKeyword(kw);
            if (!uniqueNormalized.has(normalized)) {
                uniqueNormalized.set(normalized, kw);
            }
        }
        const client = await db_1.default.connect();
        try {
            await client.query('BEGIN');
            let created = 0;
            let skipped = 0;
            const duplicates = [];
            for (const [normalized, original] of uniqueNormalized.entries()) {
                // Check duplicate
                const duplicateCheck = await client.query(`SELECT id FROM keywords 
           WHERE organization_id = $1 AND location_id = $2 AND normalized_keyword = $3 
           AND search_engine = $4 AND device = $5 AND country_code = $6 AND language_code = $7
           AND status IN ('ACTIVE', 'PAUSED')`, [
                    organizationId, payload.locationId, normalized,
                    payload.searchEngine, payload.device, payload.countryCode, payload.languageCode
                ]);
                if (duplicateCheck.rows.length > 0) {
                    skipped++;
                    duplicates.push(original);
                    continue;
                }
                // Insert
                await client.query(`INSERT INTO keywords (
            organization_id, business_id, location_id, keyword, normalized_keyword,
            search_engine, country_code, language_code, device
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
                    organizationId, payload.businessId, payload.locationId, original, normalized,
                    payload.searchEngine, payload.countryCode, payload.languageCode, payload.device
                ]);
                created++;
            }
            await client.query('COMMIT');
            return { created, skipped, duplicates, invalid: payload.keywords.length - uniqueNormalized.size };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    static async update(organizationId, keywordId, payload) {
        const updateData = { ...payload };
        if (payload.keyword) {
            updateData.normalizedKeyword = this.normalizeKeyword(payload.keyword);
        }
        // If we're updating configuration fields, we should theoretically check for duplicates, 
        // but typically users just pause/archive or change the original casing.
        // If they change searchEngine/device, it could clash, let the DB unique index handle it and catch it if needed.
        try {
            const keyword = await keyword_repository_1.KeywordRepository.update(organizationId, keywordId, updateData);
            if (!keyword) {
                throw new Error('Keyword not found');
            }
            return keyword;
        }
        catch (error) {
            if (error.code === '23505') { // unique violation in pg
                throw new Error('A keyword with this configuration already exists');
            }
            throw error;
        }
    }
    static async archive(organizationId, keywordId) {
        const keyword = await keyword_repository_1.KeywordRepository.update(organizationId, keywordId, { status: 'ARCHIVED' });
        if (!keyword) {
            throw new Error('Keyword not found');
        }
        return keyword;
    }
    // --- Keyword Locations ---
    static async listLocations(organizationId, keywordId) {
        // Verify keyword exists for this org
        await this.getById(organizationId, keywordId);
        return keyword_repository_1.KeywordRepository.listLocations(organizationId, keywordId);
    }
    static async addLocation(organizationId, keywordId, payload) {
        await this.getById(organizationId, keywordId);
        return keyword_repository_1.KeywordRepository.addLocation(organizationId, keywordId, payload);
    }
    static async removeLocation(organizationId, keywordId, locationId) {
        const success = await keyword_repository_1.KeywordRepository.removeLocation(organizationId, keywordId, locationId);
        if (!success) {
            throw new Error('Keyword location not found');
        }
        return true;
    }
}
exports.KeywordService = KeywordService;
