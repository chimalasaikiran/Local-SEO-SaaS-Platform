-- 004_create_rank_tracking_tables.sql

-- Rank Tracking Configs
CREATE TABLE IF NOT EXISTS rank_tracking_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    search_engine TEXT NOT NULL DEFAULT 'GOOGLE',
    country_code TEXT NOT NULL DEFAULT 'IN',
    language_code TEXT NOT NULL DEFAULT 'en',
    device TEXT NOT NULL DEFAULT 'DESKTOP',
    grid_size INTEGER NOT NULL DEFAULT 7 CHECK (grid_size IN (3, 5, 7, 9, 11)),
    grid_radius_meters INTEGER NOT NULL DEFAULT 5000,
    max_rank INTEGER NOT NULL DEFAULT 100,
    frequency TEXT NOT NULL DEFAULT 'MANUAL' CHECK (frequency IN ('MANUAL', 'DAILY', 'WEEKLY')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rank_tracking_configs_organization_id ON rank_tracking_configs(organization_id);
CREATE INDEX idx_rank_tracking_configs_business_id ON rank_tracking_configs(business_id);
CREATE INDEX idx_rank_tracking_configs_location_id ON rank_tracking_configs(location_id);
CREATE INDEX idx_rank_tracking_configs_status ON rank_tracking_configs(status);

-- Config Keywords
CREATE TABLE IF NOT EXISTS rank_tracking_config_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    config_id UUID NOT NULL REFERENCES rank_tracking_configs(id) ON DELETE CASCADE,
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(config_id, keyword_id)
);

CREATE INDEX idx_rank_config_keywords_organization_id ON rank_tracking_config_keywords(organization_id);
CREATE INDEX idx_rank_config_keywords_config_id ON rank_tracking_config_keywords(config_id);
CREATE INDEX idx_rank_config_keywords_keyword_id ON rank_tracking_config_keywords(keyword_id);

-- Rank Grid Points
CREATE TABLE IF NOT EXISTS rank_grid_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    config_id UUID NOT NULL REFERENCES rank_tracking_configs(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    row_index INTEGER NOT NULL,
    column_index INTEGER NOT NULL,
    distance_from_center_meters DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rank_grid_points_organization_id ON rank_grid_points(organization_id);
CREATE INDEX idx_rank_grid_points_config_id ON rank_grid_points(config_id);
CREATE INDEX idx_rank_grid_points_config_row_col ON rank_grid_points(config_id, row_index, column_index);

-- Rank Tracking Runs
CREATE TABLE IF NOT EXISTS rank_tracking_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    config_id UUID NOT NULL REFERENCES rank_tracking_configs(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_jobs INTEGER NOT NULL DEFAULT 0,
    completed_jobs INTEGER NOT NULL DEFAULT 0,
    failed_jobs INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rank_tracking_runs_organization_id ON rank_tracking_runs(organization_id);
CREATE INDEX idx_rank_tracking_runs_config_id ON rank_tracking_runs(config_id);
CREATE INDEX idx_rank_tracking_runs_status ON rank_tracking_runs(status);
CREATE INDEX idx_rank_tracking_runs_created_at ON rank_tracking_runs(created_at);

-- Rank Tracking Jobs
CREATE TABLE IF NOT EXISTS rank_tracking_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    run_id UUID NOT NULL REFERENCES rank_tracking_runs(id) ON DELETE CASCADE,
    config_id UUID NOT NULL REFERENCES rank_tracking_configs(id) ON DELETE CASCADE,
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    grid_point_id UUID NOT NULL REFERENCES rank_grid_points(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING')),
    attempts INTEGER NOT NULL DEFAULT 0,
    error_code TEXT,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rank_tracking_jobs_organization_id ON rank_tracking_jobs(organization_id);
CREATE INDEX idx_rank_tracking_jobs_run_id ON rank_tracking_jobs(run_id);
CREATE INDEX idx_rank_tracking_jobs_config_id ON rank_tracking_jobs(config_id);
CREATE INDEX idx_rank_tracking_jobs_keyword_id ON rank_tracking_jobs(keyword_id);
CREATE INDEX idx_rank_tracking_jobs_grid_point_id ON rank_tracking_jobs(grid_point_id);
CREATE INDEX idx_rank_tracking_jobs_status ON rank_tracking_jobs(status);

-- Extend keyword_rankings (from STEP 4)
ALTER TABLE keyword_rankings ADD COLUMN IF NOT EXISTS grid_point_id UUID REFERENCES rank_grid_points(id) ON DELETE SET NULL;
ALTER TABLE keyword_rankings ADD COLUMN IF NOT EXISTS run_id UUID REFERENCES rank_tracking_runs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_keyword_rankings_grid_point_id ON keyword_rankings(grid_point_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_run_id ON keyword_rankings(run_id);
-- Composite indexes for latest-ranking queries
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_latest ON keyword_rankings(organization_id, keyword_id, grid_point_id, checked_at DESC);

-- Trigger to update 'updated_at' on rank_tracking_configs
CREATE OR REPLACE FUNCTION trigger_set_rank_tracking_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_rank_tracking_configs_updated_at
BEFORE UPDATE ON rank_tracking_configs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_rank_tracking_configs_updated_at();
