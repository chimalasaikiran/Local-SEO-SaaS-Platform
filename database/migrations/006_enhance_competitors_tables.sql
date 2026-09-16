-- Migration: 006_enhance_competitors_tables
-- Description: Enhance competitors table and create snapshots for tracking

-- 1. Enhance competitors table
ALTER TABLE competitors ADD COLUMN tracking_status TEXT NOT NULL DEFAULT 'TRACKED';
ALTER TABLE competitors ADD CONSTRAINT chk_competitors_tracking_status CHECK (tracking_status IN ('TRACKED', 'UNTRACKED', 'ARCHIVED'));
ALTER TABLE competitors ADD COLUMN notes TEXT NULL;
ALTER TABLE competitors ADD COLUMN first_discovered_at TIMESTAMPTZ NULL DEFAULT NOW();
ALTER TABLE competitors ADD COLUMN last_seen_at TIMESTAMPTZ NULL DEFAULT NOW();

CREATE INDEX idx_competitors_tracking_status ON competitors(tracking_status);

-- 2. Create competitor_snapshots table
CREATE TABLE competitor_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NULL,
    website_url TEXT NULL,
    phone TEXT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    distance_meters DOUBLE PRECISION NOT NULL,
    source TEXT NOT NULL,
    metadata JSONB NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for snapshots
CREATE INDEX idx_competitor_snapshots_org_id ON competitor_snapshots(organization_id);
CREATE INDEX idx_competitor_snapshots_competitor_id ON competitor_snapshots(competitor_id);
CREATE INDEX idx_competitor_snapshots_captured_at ON competitor_snapshots(captured_at);
