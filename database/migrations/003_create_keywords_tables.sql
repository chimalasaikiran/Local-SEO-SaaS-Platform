-- 003_create_keywords_tables.sql

-- Keywords Table
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    normalized_keyword TEXT NOT NULL,
    search_engine TEXT NOT NULL DEFAULT 'GOOGLE',
    country_code TEXT NOT NULL DEFAULT 'IN',
    language_code TEXT NOT NULL DEFAULT 'en',
    device TEXT NOT NULL DEFAULT 'DESKTOP',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for keywords
CREATE INDEX idx_keywords_organization_id ON keywords(organization_id);
CREATE INDEX idx_keywords_business_id ON keywords(business_id);
CREATE INDEX idx_keywords_location_id ON keywords(location_id);
CREATE INDEX idx_keywords_status ON keywords(status);
CREATE INDEX idx_keywords_normalized_keyword ON keywords(normalized_keyword);
CREATE INDEX idx_keywords_org_location ON keywords(organization_id, location_id);
CREATE INDEX idx_keywords_org_normalized ON keywords(organization_id, normalized_keyword);

-- Prevent duplicate active/paused keywords for the same org/location/search configuration
CREATE UNIQUE INDEX idx_keywords_unique_config 
ON keywords(organization_id, location_id, normalized_keyword, search_engine, device, country_code, language_code)
WHERE status IN ('ACTIVE', 'PAUSED');


-- Keyword Locations Table (for future geo-grid tracking)
CREATE TABLE IF NOT EXISTS keyword_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER,
    label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for keyword_locations
CREATE INDEX idx_keyword_locations_organization_id ON keyword_locations(organization_id);
CREATE INDEX idx_keyword_locations_keyword_id ON keyword_locations(keyword_id);
CREATE INDEX idx_keyword_locations_lat_lng ON keyword_locations(latitude, longitude);


-- Keyword Rankings Table (Historical Tracking)
CREATE TABLE IF NOT EXISTS keyword_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    keyword_location_id UUID REFERENCES keyword_locations(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    search_engine TEXT NOT NULL,
    device TEXT NOT NULL,
    position INTEGER, -- NULL means not found in top N
    visibility_score DECIMAL,
    checked_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for keyword_rankings
CREATE INDEX idx_keyword_rankings_organization_id ON keyword_rankings(organization_id);
CREATE INDEX idx_keyword_rankings_keyword_id ON keyword_rankings(keyword_id);
CREATE INDEX idx_keyword_rankings_keyword_location_id ON keyword_rankings(keyword_location_id);
CREATE INDEX idx_keyword_rankings_checked_at ON keyword_rankings(checked_at);
CREATE INDEX idx_keyword_rankings_org_keyword_checked ON keyword_rankings(organization_id, keyword_id, checked_at);

-- Trigger to update 'updated_at' on keywords
CREATE OR REPLACE FUNCTION trigger_set_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_keywords_updated_at
BEFORE UPDATE ON keywords
FOR EACH ROW
EXECUTE FUNCTION trigger_set_keywords_updated_at();
