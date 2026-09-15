import { KeywordRepository } from './keyword.repository';
import { CreateKeywordInput, BulkCreateKeywordsInput, UpdateKeywordInput, ListKeywordsQuery, CreateKeywordLocationInput } from './keyword.schema';
import pool from '../../config/db';

export class KeywordService {
  /**
   * Normalizes a keyword by lowercasing, trimming, and collapsing whitespace.
   */
  static normalizeKeyword(keyword: string): string {
    return keyword.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  static async list(organizationId: string, query: ListKeywordsQuery) {
    return KeywordRepository.list(organizationId, query);
  }

  static async getById(organizationId: string, keywordId: string) {
    const keyword = await KeywordRepository.findById(organizationId, keywordId);
    if (!keyword) {
      throw new Error('Keyword not found');
    }
    return keyword;
  }

  static async create(organizationId: string, payload: CreateKeywordInput) {
    // Validate business and location ownership
    const validationQuery = `
      SELECT b.organization_id as b_org, l.organization_id as l_org, l.business_id as l_bus
      FROM locations l
      JOIN businesses b ON l.business_id = b.id
      WHERE l.id = $1 AND b.id = $2
    `;
    const validationResult = await pool.query(validationQuery, [payload.locationId, payload.businessId]);
    
    if (validationResult.rows.length === 0) {
      throw new Error('Location or Business not found, or they do not match');
    }
    
    const { b_org, l_org } = validationResult.rows[0];
    if (b_org !== organizationId || l_org !== organizationId) {
      throw new Error('Location or Business does not belong to your organization');
    }

    const normalizedKeyword = this.normalizeKeyword(payload.keyword);

    // Check for existing active/paused duplicate
    const duplicateCheck = await pool.query(
      `SELECT id FROM keywords 
       WHERE organization_id = $1 AND location_id = $2 AND normalized_keyword = $3 
       AND search_engine = $4 AND device = $5 AND country_code = $6 AND language_code = $7
       AND status IN ('ACTIVE', 'PAUSED')`,
      [
        organizationId, payload.locationId, normalizedKeyword, 
        payload.searchEngine, payload.device, payload.countryCode, payload.languageCode
      ]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error('Keyword with this configuration already exists for this location');
    }

    return KeywordRepository.create(organizationId, { ...payload, normalizedKeyword });
  }

  static async bulkCreate(organizationId: string, payload: BulkCreateKeywordsInput) {
    // Validate business and location ownership
    const validationQuery = `
      SELECT b.organization_id as b_org, l.organization_id as l_org
      FROM locations l
      JOIN businesses b ON l.business_id = b.id
      WHERE l.id = $1 AND b.id = $2
    `;
    const validationResult = await pool.query(validationQuery, [payload.locationId, payload.businessId]);
    
    if (validationResult.rows.length === 0) {
      throw new Error('Location or Business not found, or they do not match');
    }
    
    const { b_org, l_org } = validationResult.rows[0];
    if (b_org !== organizationId || l_org !== organizationId) {
      throw new Error('Location or Business does not belong to your organization');
    }

    // Process and normalize keywords, removing duplicates from the input
    const uniqueNormalized = new Map<string, string>(); // normalized -> original
    for (const kw of payload.keywords) {
      const normalized = this.normalizeKeyword(kw);
      if (!uniqueNormalized.has(normalized)) {
        uniqueNormalized.set(normalized, kw);
      }
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let created = 0;
      let skipped = 0;
      const duplicates: string[] = [];

      for (const [normalized, original] of uniqueNormalized.entries()) {
        // Check duplicate
        const duplicateCheck = await client.query(
          `SELECT id FROM keywords 
           WHERE organization_id = $1 AND location_id = $2 AND normalized_keyword = $3 
           AND search_engine = $4 AND device = $5 AND country_code = $6 AND language_code = $7
           AND status IN ('ACTIVE', 'PAUSED')`,
          [
            organizationId, payload.locationId, normalized, 
            payload.searchEngine, payload.device, payload.countryCode, payload.languageCode
          ]
        );

        if (duplicateCheck.rows.length > 0) {
          skipped++;
          duplicates.push(original);
          continue;
        }

        // Insert
        await client.query(
          `INSERT INTO keywords (
            organization_id, business_id, location_id, keyword, normalized_keyword,
            search_engine, country_code, language_code, device
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            organizationId, payload.businessId, payload.locationId, original, normalized,
            payload.searchEngine, payload.countryCode, payload.languageCode, payload.device
          ]
        );
        created++;
      }

      await client.query('COMMIT');
      
      return { created, skipped, duplicates, invalid: payload.keywords.length - uniqueNormalized.size };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(organizationId: string, keywordId: string, payload: UpdateKeywordInput) {
    const updateData: any = { ...payload };
    if (payload.keyword) {
      updateData.normalizedKeyword = this.normalizeKeyword(payload.keyword);
    }
    
    // If we're updating configuration fields, we should theoretically check for duplicates, 
    // but typically users just pause/archive or change the original casing.
    // If they change searchEngine/device, it could clash, let the DB unique index handle it and catch it if needed.
    
    try {
      const keyword = await KeywordRepository.update(organizationId, keywordId, updateData);
      if (!keyword) {
        throw new Error('Keyword not found');
      }
      return keyword;
    } catch (error: any) {
      if (error.code === '23505') { // unique violation in pg
        throw new Error('A keyword with this configuration already exists');
      }
      throw error;
    }
  }

  static async archive(organizationId: string, keywordId: string) {
    const keyword = await KeywordRepository.update(organizationId, keywordId, { status: 'ARCHIVED' });
    if (!keyword) {
      throw new Error('Keyword not found');
    }
    return keyword;
  }

  // --- Keyword Locations ---
  static async listLocations(organizationId: string, keywordId: string) {
    // Verify keyword exists for this org
    await this.getById(organizationId, keywordId);
    return KeywordRepository.listLocations(organizationId, keywordId);
  }

  static async addLocation(organizationId: string, keywordId: string, payload: CreateKeywordLocationInput) {
    await this.getById(organizationId, keywordId);
    return KeywordRepository.addLocation(organizationId, keywordId, payload);
  }

  static async removeLocation(organizationId: string, keywordId: string, locationId: string) {
    const success = await KeywordRepository.removeLocation(organizationId, keywordId, locationId);
    if (!success) {
      throw new Error('Keyword location not found');
    }
    return true;
  }
}
