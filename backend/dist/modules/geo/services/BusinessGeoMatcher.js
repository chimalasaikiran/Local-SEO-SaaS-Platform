"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessGeoMatcher = void 0;
const GeoPlaceNormalizationService_1 = require("./GeoPlaceNormalizationService");
class BusinessGeoMatcher {
    /**
     * Attempts to match a business/location to a list of GeoPlaces.
     */
    static match(businessName, businessPhone, businessWebsite, places) {
        if (!places.length) {
            return { confidence: 'NONE' };
        }
        const normName = GeoPlaceNormalizationService_1.GeoPlaceNormalizationService.normalizeString(businessName);
        const normPhone = businessPhone ? GeoPlaceNormalizationService_1.GeoPlaceNormalizationService.normalizePhone(businessPhone) : null;
        const normUrl = businessWebsite ? GeoPlaceNormalizationService_1.GeoPlaceNormalizationService.normalizeUrl(businessWebsite) : null;
        for (const place of places) {
            const placeNormName = GeoPlaceNormalizationService_1.GeoPlaceNormalizationService.normalizeString(place.name);
            const placeNormPhone = place.phone ? GeoPlaceNormalizationService_1.GeoPlaceNormalizationService.normalizePhone(place.phone) : null;
            const placeNormUrl = place.websiteUrl ? GeoPlaceNormalizationService_1.GeoPlaceNormalizationService.normalizeUrl(place.websiteUrl) : null;
            // High confidence match: Name + Phone or Name + Website
            const nameMatch = normName === placeNormName || placeNormName.includes(normName) || normName.includes(placeNormName);
            if (nameMatch) {
                if (normPhone && placeNormPhone && normPhone === placeNormPhone) {
                    return { confidence: 'HIGH', matchedPlace: place };
                }
                if (normUrl && placeNormUrl && normUrl === placeNormUrl) {
                    return { confidence: 'HIGH', matchedPlace: place };
                }
                // If we just have name match and they are close (we assume places passed here are already nearby)
                return { confidence: 'POSSIBLE', matchedPlace: place };
            }
            // Secondary check: If phone or website match exactly despite name difference
            if (normPhone && placeNormPhone && normPhone === placeNormPhone) {
                return { confidence: 'POSSIBLE', matchedPlace: place };
            }
            if (normUrl && placeNormUrl && normUrl === placeNormUrl) {
                return { confidence: 'POSSIBLE', matchedPlace: place };
            }
        }
        return { confidence: 'NONE' };
    }
}
exports.BusinessGeoMatcher = BusinessGeoMatcher;
