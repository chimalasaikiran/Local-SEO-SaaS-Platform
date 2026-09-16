import { GeoPlace } from './GeoProvider';
import { OverpassQueryBuilder } from '../utils/OverpassQueryBuilder';

export interface OsmPoiProviderConfig {
  baseUrl?: string;
}

export class OsmPoiProvider {
  private baseUrl: string;
  private queryBuilder: OverpassQueryBuilder;

  constructor(config?: OsmPoiProviderConfig) {
    this.baseUrl = config?.baseUrl || process.env.OVERPASS_BASE_URL || 'https://overpass.openstreetmap.fr/api/interpreter';
    this.queryBuilder = new OverpassQueryBuilder();
  }

  /**
   * Search for places (POIs) nearby a given coordinate.
   */
  async searchNearby(category: string, lat: number, lon: number, radiusMeters: number, limit: number = 50): Promise<GeoPlace[]> {
    const query = this.queryBuilder.buildNearbyQuery(category, lat, lon, radiusMeters, limit);
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'LocalSEOPlatform/1.0'
      },
      body: new URLSearchParams({ data: query })
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.elements) {
      return [];
    }

    return data.elements.map((el: any): GeoPlace => {
      // Overpass can return nodes, ways, or relations. 
      // Nodes have lat/lon directly. Ways/relations with 'out center' have center.lat/center.lon.
      const latitude = el.lat || el.center?.lat;
      const longitude = el.lon || el.center?.lon;
      
      const tags = el.tags || {};
      
      return {
        source: 'osm',
        sourceId: `${el.type}/${el.id}`,
        name: tags.name || tags['name:en'] || 'Unknown Business',
        category: category,
        subcategory: tags.amenity || tags.shop || tags.office || tags.tourism || tags.craft || tags.leisure,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        addressLine1: tags['addr:housenumber'] ? `${tags['addr:housenumber']} ${tags['addr:street'] || ''}`.trim() : (tags['addr:street'] || undefined),
        city: tags['addr:city'],
        state: tags['addr:state'],
        postalCode: tags['addr:postcode'],
        country: tags['addr:country'],
        phone: tags.phone || tags['contact:phone'],
        websiteUrl: tags.website || tags['contact:website'],
        metadata: {
          osm_type: el.type,
          osm_id: el.id,
          tags: tags
        }
      };
    }).filter((place: GeoPlace) => place.latitude && place.longitude && place.name !== 'Unknown Business');
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Send a very small query just to check if it's up
      const query = '[out:json][timeout:1];node(0,0,0,0);out 1;';
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'LocalSEOPlatform/1.0'
        },
        body: new URLSearchParams({ data: query })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
