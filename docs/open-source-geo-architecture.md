# Open-Source Geo & Competitor Data Engine

## Overview
This platform utilizes an open-source, self-hosted-first geographic data architecture. We explicitly avoid proprietary Google APIs (Google Maps, Places, Search) for baseline competitor discovery and map rendering.

## Architecture Components
- **Map Rendering**: MapLibre GL JS
- **Database**: PostgreSQL with PostGIS extension for spatial queries (`geo_places` table).
- **Geocoding & Reverse Geocoding**: Nominatim
- **Point of Interest (POI) Discovery**: OpenStreetMap via Overpass API

## Data Model & Tenant Isolation
1. **`geo_places`**: A global, shared cache of places discovered from OSM.
2. **`competitors`**: A tenant-isolated relationship mapping an organization's business location to a specific `geo_place`.

## Important Disclaimers regarding Google
- **OpenStreetMap data is not Google Maps ranking data.**
- Competitor discovery from OSM does not indicate Google search or Google Maps ranking.
- Open Geo Visibility metrics are based purely on physical POI density in OpenStreetMap, not search engine algorithmic performance.
- The ranking provider abstraction remains available for a future legitimate Google ranking-data provider.

## Self-Hosting
We provide setup scripts in the `/scripts` directory to help developers initialize local Docker containers for Nominatim and Overpass. Avoid downloading the full planet dataset unless operating large-scale infrastructure; prefer regional extracts (e.g., Geofabrik).
