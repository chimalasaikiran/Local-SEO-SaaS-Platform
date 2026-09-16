import { GeoPlace } from '../providers/GeoProvider';

export class GeoPlaceNormalizationService {
  
  /**
   * Generates a deterministic signature for a place to detect duplicates.
   * Helps when OSM has multiple nodes for the same business.
   */
  static generateSignature(place: GeoPlace): string {
    const normalizedName = this.normalizeString(place.name);
    // Round to ~100m precision to catch slight coordinate variations
    const latRounded = place.latitude.toFixed(3);
    const lonRounded = place.longitude.toFixed(3);
    
    // We prioritize phone or website if they exist, else rely on name + location
    if (place.phone) {
      return `${normalizedName}_${this.normalizePhone(place.phone)}`;
    }
    
    if (place.websiteUrl) {
       return `${normalizedName}_${this.normalizeUrl(place.websiteUrl)}`;
    }

    return `${normalizedName}_${latRounded}_${lonRounded}`;
  }

  /**
   * Deduplicates an array of GeoPlaces based on their signatures.
   * Keeps the first one encountered (or could be enhanced to keep the most detailed one).
   */
  static deduplicate(places: GeoPlace[]): GeoPlace[] {
    const seen = new Set<string>();
    const result: GeoPlace[] = [];

    for (const place of places) {
      // If we have an exact sourceId match, it's definitely a duplicate
      const idKey = `id_${place.source}_${place.sourceId}`;
      if (seen.has(idKey)) continue;
      seen.add(idKey);

      // Fuzzy duplicate check
      const sig = this.generateSignature(place);
      if (seen.has(sig)) continue;
      seen.add(sig);

      result.push(place);
    }

    return result;
  }

  static normalizeString(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  static normalizePhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  static normalizeUrl(url: string): string {
    return url.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
}
