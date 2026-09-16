-- Migration: 005_create_geo_competitor_tables
-- Description: Create geo_places and competitors tables for local SEO and discovery

CREATE EXTENSION IF NOT EXISTS postgis;

-- Create geo_places table
-- This serves as a global cache/repository of POIs from OpenStreetMap or other sources
CREATE TABLE geo_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    source_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address_line_1 TEXT NULL,
    address_line_2 TEXT NULL,
    city TEXT NULL,
    state TEXT NULL,
    postal_code TEXT NULL,
    country TEXT NULL,
    phone TEXT NULL,
    website_url TEXT NULL,
    metadata JSONB NULL,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source, source_id)
);

-- Indexes for geo_places
CREATE INDEX idx_geo_places_org_id ON geo_places(organization_id);
CREATE INDEX idx_geo_places_source ON geo_places(source, source_id);
CREATE INDEX idx_geo_places_category ON geo_places(category);
CREATE INDEX idx_geo_places_location ON geo_places USING GIST (location);
CREATE INDEX idx_geo_places_city_state ON geo_places(city, state, country);
CREATE INDEX idx_geo_places_name ON geo_places(name);

-- Create competitors table
-- This maps discovered or manually added competitors to a specific organization's business location
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    geo_place_id UUID NULL REFERENCES geo_places(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    website_url TEXT NULL,
    phone TEXT NULL,
    category TEXT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    distance_meters DOUBLE PRECISION NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, business_id, location_id, geo_place_id),
    CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DISCOVERED'))
);

-- Indexes for competitors
CREATE INDEX idx_competitors_org_id ON competitors(organization_id);
CREATE INDEX idx_competitors_business_id ON competitors(business_id);
CREATE INDEX idx_competitors_location_id ON competitors(location_id);
CREATE INDEX idx_competitors_geo_place_id ON competitors(geo_place_id);
CREATE INDEX idx_competitors_status ON competitors(status);
