"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoController = void 0;
const NominatimGeoProvider_1 = require("./providers/NominatimGeoProvider");
const OsmPoiProvider_1 = require("./providers/OsmPoiProvider");
const zod_1 = require("zod");
const nominatim = new NominatimGeoProvider_1.NominatimGeoProvider();
const osmPoi = new OsmPoiProvider_1.OsmPoiProvider();
// Validators
const GeocodeQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1).max(50).optional()
}).refine(data => data.q || data.address || data.city || data.postalCode, {
    message: "At least one search parameter (q, address, city, postalCode) must be provided."
});
const ReverseGeocodeQuerySchema = zod_1.z.object({
    latitude: zod_1.z.coerce.number().min(-90).max(90),
    longitude: zod_1.z.coerce.number().min(-180).max(180)
});
const NearbyQuerySchema = zod_1.z.object({
    latitude: zod_1.z.coerce.number().min(-90).max(90),
    longitude: zod_1.z.coerce.number().min(-180).max(180),
    category: zod_1.z.string().min(2).max(50),
    radius: zod_1.z.coerce.number().min(100).max(50000).default(5000),
    limit: zod_1.z.coerce.number().min(1).max(500).default(50)
});
class GeoController {
    static async geocode(req, res) {
        try {
            const query = GeocodeQuerySchema.parse(req.query);
            const results = await nominatim.geocode(query);
            return res.json({ data: results });
        }
        catch (error) {
            console.error('Geocode error:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues });
            }
            return res.status(500).json({ error: 'Failed to geocode' });
        }
    }
    static async reverseGeocode(req, res) {
        try {
            const query = ReverseGeocodeQuerySchema.parse(req.query);
            const result = await nominatim.reverseGeocode(query.latitude, query.longitude);
            return res.json({ data: result });
        }
        catch (error) {
            console.error('Reverse Geocode error:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues });
            }
            return res.status(500).json({ error: 'Failed to reverse geocode' });
        }
    }
    static async nearby(req, res) {
        try {
            const query = NearbyQuerySchema.parse(req.query);
            const results = await osmPoi.searchNearby(query.category, query.latitude, query.longitude, query.radius, query.limit);
            return res.json({ data: results });
        }
        catch (error) {
            console.error('Nearby POI search error:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues });
            }
            return res.status(500).json({ error: 'Failed to find nearby places' });
        }
    }
}
exports.GeoController = GeoController;
