export interface GeoPlace {
  id?: string;
  source: string;
  sourceId: string;
  name: string;
  category: string;
  subcategory?: string;
  latitude: number;
  longitude: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  websiteUrl?: string;
  metadata?: any;
}

export interface GeocodeQuery {
  q?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  limit?: number;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  formattedAddress?: string;
}

export interface SearchPlacesRequest {
  category: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  limit?: number;
}

export interface GeoProvider {
  geocode(query: GeocodeQuery): Promise<GeocodeResult[]>;
  reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult | null>;
  searchPlaces(request: SearchPlacesRequest): Promise<GeoPlace[]>;
  healthCheck(): Promise<boolean>;
}
