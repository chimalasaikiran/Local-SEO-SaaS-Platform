import { GeoPlace } from '../providers/GeoProvider';
import { GeoPlaceNormalizationService } from './GeoPlaceNormalizationService';

export interface MatchResult {
  confidence: 'HIGH' | 'POSSIBLE' | 'NONE';
  matchedPlace?: GeoPlace;
}

export class BusinessGeoMatcher {
  /**
   * Attempts to match a business/location to a list of GeoPlaces.
   */
  static match(
    businessName: string, 
    businessPhone: string | null, 
    businessWebsite: string | null, 
    places: GeoPlace[]
  ): MatchResult {
    if (!places.length) {
      return { confidence: 'NONE' };
    }

    const normName = GeoPlaceNormalizationService.normalizeString(businessName);
    const normPhone = businessPhone ? GeoPlaceNormalizationService.normalizePhone(businessPhone) : null;
    const normUrl = businessWebsite ? GeoPlaceNormalizationService.normalizeUrl(businessWebsite) : null;

    for (const place of places) {
      const placeNormName = GeoPlaceNormalizationService.normalizeString(place.name);
      const placeNormPhone = place.phone ? GeoPlaceNormalizationService.normalizePhone(place.phone) : null;
      const placeNormUrl = place.websiteUrl ? GeoPlaceNormalizationService.normalizeUrl(place.websiteUrl) : null;

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
