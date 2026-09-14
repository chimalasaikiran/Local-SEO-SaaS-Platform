-- Migration: 002_create_businesses_locations
-- Description: Create businesses and locations tables

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    website_url TEXT NULL,
    phone TEXT NULL,
    primary_category TEXT NULL,
    description TEXT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, slug),
    CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

-- Indexes for businesses
CREATE INDEX idx_businesses_organization_id ON businesses(organization_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_org_status ON businesses(organization_id, status);

-- Locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT NULL,
    city TEXT NOT NULL,
    state TEXT NULL,
    postal_code TEXT NULL,
    country TEXT NOT NULL,
    latitude DOUBLE PRECISION NULL,
    longitude DOUBLE PRECISION NULL,
    timezone TEXT NULL,
    phone TEXT NULL,
    website_url TEXT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

-- Indexes for locations
CREATE INDEX idx_locations_organization_id ON locations(organization_id);
CREATE INDEX idx_locations_business_id ON locations(business_id);
CREATE INDEX idx_locations_status ON locations(status);
CREATE INDEX idx_locations_org_business ON locations(organization_id, business_id);
