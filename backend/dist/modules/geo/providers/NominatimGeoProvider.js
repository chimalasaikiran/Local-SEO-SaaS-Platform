"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominatimGeoProvider = void 0;
class NominatimGeoProvider {
    baseUrl;
    constructor() {
        this.baseUrl = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';
    }
    async fetchWithUserAgent(url, options) {
        const headers = new Headers(options?.headers || {});
        // Nominatim requires a valid user agent
        headers.set('User-Agent', 'LocalSEOPlatform/1.0 (local-seo-platform@example.com)');
        return fetch(url, { ...options, headers });
    }
    async geocode(query) {
        const url = new URL(`${this.baseUrl}/search`);
        url.searchParams.append('format', 'json');
        url.searchParams.append('addressdetails', '1');
        url.searchParams.append('limit', (query.limit || 5).toString());
        if (query.q) {
            url.searchParams.append('q', query.q);
        }
        else {
            if (query.address)
                url.searchParams.append('street', query.address);
            if (query.city)
                url.searchParams.append('city', query.city);
            if (query.state)
                url.searchParams.append('state', query.state);
            if (query.country)
                url.searchParams.append('country', query.country);
            if (query.postalCode)
                url.searchParams.append('postalcode', query.postalCode);
        }
        const response = await this.fetchWithUserAgent(url.toString());
        if (!response.ok) {
            throw new Error(`Nominatim geocode error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.map((item) => ({
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            address: item.address?.house_number ? `${item.address.house_number} ${item.address.road || ''}`.trim() : (item.address?.road || ''),
            city: item.address?.city || item.address?.town || item.address?.village,
            state: item.address?.state,
            country: item.address?.country,
            postalCode: item.address?.postcode,
            formattedAddress: item.display_name
        }));
    }
    async reverseGeocode(latitude, longitude) {
        const url = new URL(`${this.baseUrl}/reverse`);
        url.searchParams.append('format', 'json');
        url.searchParams.append('lat', latitude.toString());
        url.searchParams.append('lon', longitude.toString());
        url.searchParams.append('addressdetails', '1');
        const response = await this.fetchWithUserAgent(url.toString());
        if (!response.ok) {
            throw new Error(`Nominatim reverse geocode error: ${response.statusText}`);
        }
        const item = await response.json();
        if (item.error) {
            return null;
        }
        return {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            addressLine1: item.address?.house_number ? `${item.address.house_number} ${item.address.road || ''}`.trim() : (item.address?.road || ''),
            city: item.address?.city || item.address?.town || item.address?.village,
            state: item.address?.state,
            postalCode: item.address?.postcode,
            country: item.address?.country,
            formattedAddress: item.display_name
        };
    }
    async searchPlaces(request) {
        // Nominatim isn't great for generic category POI discovery by radius.
        // It can do some basic amenity searches but Overpass is strictly better for this.
        // However, if we must implement it:
        const url = new URL(`${this.baseUrl}/search`);
        url.searchParams.append('format', 'json');
        url.searchParams.append('q', `[${request.category}]`);
        url.searchParams.append('addressdetails', '1');
        url.searchParams.append('extratags', '1');
        url.searchParams.append('limit', (request.limit || 50).toString());
        // Viewbox for radius approx
        // 1 degree is roughly 111km
        const radiusDeg = request.radiusMeters / 111000;
        const minLon = request.longitude - radiusDeg;
        const maxLon = request.longitude + radiusDeg;
        const minLat = request.latitude - radiusDeg;
        const maxLat = request.latitude + radiusDeg;
        url.searchParams.append('viewbox', `${minLon},${maxLat},${maxLon},${minLat}`);
        url.searchParams.append('bounded', '1');
        const response = await this.fetchWithUserAgent(url.toString());
        if (!response.ok) {
            throw new Error(`Nominatim searchPlaces error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.map((item) => ({
            source: 'nominatim',
            sourceId: item.osm_id.toString(),
            name: item.name || item.display_name.split(',')[0],
            category: item.class || request.category,
            subcategory: item.type,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            addressLine1: item.address?.house_number ? `${item.address.house_number} ${item.address.road || ''}`.trim() : (item.address?.road || ''),
            city: item.address?.city || item.address?.town || item.address?.village,
            state: item.address?.state,
            postalCode: item.address?.postcode,
            country: item.address?.country,
            phone: item.extratags?.phone || item.extratags?.['contact:phone'],
            websiteUrl: item.extratags?.website || item.extratags?.['contact:website'],
            metadata: item
        }));
    }
    async healthCheck() {
        try {
            const response = await this.fetchWithUserAgent(`${this.baseUrl}/status.php?format=json`);
            if (response.ok) {
                return true;
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
}
exports.NominatimGeoProvider = NominatimGeoProvider;
