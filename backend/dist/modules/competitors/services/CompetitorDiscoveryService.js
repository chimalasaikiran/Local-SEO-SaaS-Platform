"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitorDiscoveryService = void 0;
const db_1 = __importDefault(require("../../../config/db"));
const OsmPoiProvider_1 = require("../../geo/providers/OsmPoiProvider");
const GeoPlaceNormalizationService_1 = require("../../geo/services/GeoPlaceNormalizationService");
const BusinessGeoMatcher_1 = require("../../geo/services/BusinessGeoMatcher");
class CompetitorDiscoveryService {
    poiProvider;
    constructor() {
        this.poiProvider = new OsmPoiProvider_1.OsmPoiProvider();
    }
    async discover(req) {
        const client = await db_1.default.connect();
        try {
            // 1. Get the business and location
            const locationRes = await client.query(`SELECT l.latitude, l.longitude, b.name, b.phone, b.website_url 
         FROM locations l
         JOIN businesses b ON b.id = l.business_id
         WHERE l.id = $1 AND l.organization_id = $2`, [req.locationId, req.organizationId]);
            if (locationRes.rows.length === 0) {
                throw new Error('Location not found or unauthorized');
            }
            const location = locationRes.rows[0];
            if (!location.latitude || !location.longitude) {
                throw new Error('Location does not have coordinates set');
            }
            // 2. Fetch POIs from OSM
            let rawPlaces = await this.poiProvider.searchNearby(req.category, location.latitude, location.longitude, req.radiusMeters, req.limit || 100);
            // 3. Normalize and Deduplicate
            let places = GeoPlaceNormalizationService_1.GeoPlaceNormalizationService.deduplicate(rawPlaces);
            // 4. Exclude our own business
            const matchResult = BusinessGeoMatcher_1.BusinessGeoMatcher.match(location.name, location.phone, location.website_url, places);
            if (matchResult.confidence === 'HIGH' && matchResult.matchedPlace) {
                places = places.filter(p => p.sourceId !== matchResult.matchedPlace.sourceId);
            }
            // 5. Store/Update in geo_places (global cache) and link in competitors (tenant-specific)
            await client.query('BEGIN');
            let discoveredCount = 0;
            for (const place of places) {
                // Upsert into geo_places
                const geoPlaceRes = await client.query(`
          INSERT INTO geo_places (
            source, source_id, name, category, subcategory, 
            latitude, longitude, location, address_line_1, 
            city, state, postal_code, country, phone, website_url
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, 
            ST_SetSRID(ST_MakePoint($7, $6), 4326),
            $8, $9, $10, $11, $12, $13, $14
          )
          ON CONFLICT (source, source_id) DO UPDATE SET
            name = EXCLUDED.name,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            location = EXCLUDED.location,
            last_synced_at = NOW()
          RETURNING id
        `, [
                    place.source, place.sourceId, place.name, place.category, place.subcategory || null,
                    place.latitude, place.longitude, place.addressLine1 || null,
                    place.city || null, place.state || null, place.postalCode || null, place.country || null,
                    place.phone || null, place.websiteUrl || null
                ]);
                const geoPlaceId = geoPlaceRes.rows[0].id;
                // Calculate distance using PostGIS
                const distRes = await client.query(`
          SELECT ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
          ) as distance
        `, [location.longitude, location.latitude, place.longitude, place.latitude]);
                const distanceMeters = parseFloat(distRes.rows[0].distance);
                // Upsert competitor mapping
                await client.query(`
          INSERT INTO competitors (
            organization_id, business_id, location_id, geo_place_id,
            name, website_url, phone, category, latitude, longitude,
            distance_meters, source, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'DISCOVERED'
          )
          ON CONFLICT (organization_id, business_id, location_id, geo_place_id) 
          DO UPDATE SET 
            distance_meters = EXCLUDED.distance_meters,
            updated_at = NOW()
        `, [
                    req.organizationId, req.businessId, req.locationId, geoPlaceId,
                    place.name, place.websiteUrl || null, place.phone || null, place.category,
                    place.latitude, place.longitude, distanceMeters, place.source
                ]);
                discoveredCount++;
            }
            await client.query('COMMIT');
            return { discovered: discoveredCount };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.CompetitorDiscoveryService = CompetitorDiscoveryService;
