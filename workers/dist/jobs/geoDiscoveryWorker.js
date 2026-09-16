"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGeoDiscoveryJob = handleGeoDiscoveryJob;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});
async function handleGeoDiscoveryJob(data) {
    const { organizationId, businessId, locationId, category, radiusMeters, limit } = data;
    if (!organizationId || !businessId || !locationId || !category) {
        throw new Error('Missing required fields for geo discovery job');
    }
    console.log(`[GeoDiscoveryWorker] Starting discovery for Location ${locationId} - Category ${category}`);
    const client = await pool.connect();
    try {
        // 1. Get location
        const locRes = await client.query(`SELECT latitude, longitude FROM locations WHERE id = $1 AND organization_id = $2`, [locationId, organizationId]);
        if (locRes.rows.length === 0 || !locRes.rows[0].latitude) {
            throw new Error('Location not found or missing coordinates');
        }
        const { latitude, longitude } = locRes.rows[0];
        // 2. Fetch from Overpass
        const query = `
      [out:json][timeout:25];
      (
        node[~"^(amenity|shop|office|tourism|craft|leisure)$"~"(?i)${category}"](around:${radiusMeters || 5000},${latitude},${longitude});
        way[~"^(amenity|shop|office|tourism|craft|leisure)$"~"(?i)${category}"](around:${radiusMeters || 5000},${latitude},${longitude});
      );
      out center ${limit || 100};
    `;
        const baseUrl = process.env.OVERPASS_BASE_URL || 'https://overpass.openstreetmap.fr/api/interpreter';
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'LocalSEOPlatform/1.0'
            },
            body: new URLSearchParams({ data: query })
        });
        if (!response.ok)
            throw new Error(`Overpass API error: ${response.statusText}`);
        const json = await response.json();
        let discoveredCount = 0;
        // 3. Save to DB
        await client.query('BEGIN');
        if (json.elements) {
            for (const el of json.elements) {
                const lat = el.lat || el.center?.lat;
                const lon = el.lon || el.center?.lon;
                const name = el.tags?.name || el.tags?.['name:en'];
                if (!lat || !lon || !name)
                    continue;
                const sourceId = `${el.type}/${el.id}`;
                // Upsert geo_place
                const geoRes = await client.query(`
          INSERT INTO geo_places (
            source, source_id, name, category, latitude, longitude, location
          ) VALUES (
            'osm', $1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($5, $4), 4326)
          )
          ON CONFLICT (source, source_id) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `, [sourceId, name, category, lat, lon]);
                const geoPlaceId = geoRes.rows[0].id;
                // Calculate distance
                const distRes = await client.query(`
          SELECT ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
          ) as distance
        `, [longitude, latitude, lon, lat]);
                const distanceMeters = parseFloat(distRes.rows[0].distance);
                // Upsert competitor
                await client.query(`
          INSERT INTO competitors (
            organization_id, business_id, location_id, geo_place_id,
            name, category, latitude, longitude, distance_meters, source, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, 'osm', 'DISCOVERED'
          )
          ON CONFLICT (organization_id, business_id, location_id, geo_place_id) 
          DO UPDATE SET distance_meters = EXCLUDED.distance_meters
        `, [organizationId, businessId, locationId, geoPlaceId, name, category, lat, lon, distanceMeters]);
                discoveredCount++;
            }
        }
        await client.query('COMMIT');
        console.log(`[GeoDiscoveryWorker] Discovered ${discoveredCount} places`);
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
