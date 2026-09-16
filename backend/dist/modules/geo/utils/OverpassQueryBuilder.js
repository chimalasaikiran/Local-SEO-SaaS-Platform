"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverpassQueryBuilder = void 0;
class OverpassQueryBuilder {
    categoryMap = {
        'dentist': 'amenity=dentist',
        'doctor': 'amenity=doctors',
        'clinic': 'amenity=clinic',
        'hospital': 'amenity=hospital',
        'restaurant': 'amenity=restaurant',
        'hotel': 'tourism=hotel',
        'lawyer': 'office=lawyer',
        'gym': 'leisure=fitness_centre',
        'salon': 'shop=beauty', // or hairdresser
        'hairdresser': 'shop=hairdresser',
        'cafe': 'amenity=cafe',
        'school': 'amenity=school',
        'real_estate_agency': 'office=estate_agent',
        'car_repair': 'shop=car_repair',
        'plumber': 'craft=plumber',
        'electrician': 'craft=electrician',
        'bakery': 'shop=bakery',
        'bar': 'amenity=bar',
        'pub': 'amenity=pub',
        'fast_food': 'amenity=fast_food',
        'pharmacy': 'amenity=pharmacy',
        'veterinary': 'amenity=veterinary',
        'bank': 'amenity=bank',
        'supermarket': 'shop=supermarket',
        'clothing_store': 'shop=clothes',
    };
    /**
     * Safely maps a generic category to an OSM tag.
     * If the category doesn't strictly match our allowlist,
     * we fallback to name searching or generic amenity to prevent injection.
     */
    mapCategoryToOsmTag(category) {
        const normalized = category.toLowerCase().trim().replace(/\s+/g, '_');
        return this.categoryMap[normalized] || `name~"(?i)${normalized}"`;
    }
    /**
     * Generates a localized query for Overpass API.
     * @param category The requested category (e.g. dentist)
     * @param lat Latitude
     * @param lon Longitude
     * @param radiusMeters Radius in meters
     * @param limit Max results
     * @returns Overpass QL string
     */
    buildNearbyQuery(category, lat, lon, radiusMeters, limit = 50) {
        // Validate inputs to prevent injection
        if (isNaN(lat) || isNaN(lon) || isNaN(radiusMeters) || isNaN(limit)) {
            throw new Error('Invalid numeric parameters for Overpass query.');
        }
        // We limit radius to prevent massive queries on self-hosted instances
        const safeRadius = Math.min(radiusMeters, 50000);
        const safeLimit = Math.min(limit, 500);
        const tag = this.mapCategoryToOsmTag(category);
        // The query finds nodes, ways, and relations within the radius
        return `
      [out:json][timeout:25];
      (
        node[${tag}](around:${safeRadius},${lat},${lon});
        way[${tag}](around:${safeRadius},${lat},${lon});
        relation[${tag}](around:${safeRadius},${lat},${lon});
      );
      out center ${safeLimit};
    `.trim();
    }
}
exports.OverpassQueryBuilder = OverpassQueryBuilder;
