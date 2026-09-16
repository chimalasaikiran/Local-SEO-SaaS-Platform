-- Step 7: SEO Audit Engine Tables

CREATE TYPE audit_type AS ENUM ('FULL_AUDIT', 'TECHNICAL_AUDIT', 'LOCAL_AUDIT', 'PAGE_AUDIT');
CREATE TYPE audit_status AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED');
CREATE TYPE issue_severity AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');
CREATE TYPE issue_status AS ENUM ('OPEN', 'IGNORED', 'RESOLVED');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS seo_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    type audit_type NOT NULL,
    target_url TEXT NOT NULL,
    status audit_status NOT NULL DEFAULT 'QUEUED',
    score INTEGER,
    score_version VARCHAR(20) DEFAULT 'v1',
    pages_discovered INTEGER DEFAULT 0,
    pages_crawled INTEGER DEFAULT 0,
    issues_count INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_audit_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES seo_audits(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    status_code INTEGER,
    content_type VARCHAR(255),
    title TEXT,
    meta_description TEXT,
    canonical_url TEXT,
    robots_directive TEXT,
    word_count INTEGER DEFAULT 0,
    h1_count INTEGER DEFAULT 0,
    h2_count INTEGER DEFAULT 0,
    internal_links_count INTEGER DEFAULT 0,
    external_links_count INTEGER DEFAULT 0,
    image_count INTEGER DEFAULT 0,
    images_missing_alt INTEGER DEFAULT 0,
    load_time_ms INTEGER,
    crawled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_audit_pages_audit_id ON seo_audit_pages(audit_id);
CREATE INDEX idx_seo_audit_pages_normalized_url ON seo_audit_pages(audit_id, normalized_url);

CREATE TABLE IF NOT EXISTS seo_audit_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES seo_audits(id) ON DELETE CASCADE,
    page_id UUID REFERENCES seo_audit_pages(id) ON DELETE CASCADE,
    check_code VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity issue_severity NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    recommendation TEXT,
    evidence JSONB,
    status issue_status NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_audit_issues_audit_id ON seo_audit_issues(audit_id);
CREATE INDEX idx_seo_audit_issues_check_code ON seo_audit_issues(audit_id, check_code);

-- Triggers for updated_at
CREATE TRIGGER update_seo_audits_updated_at
    BEFORE UPDATE ON seo_audits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_audit_issues_updated_at
    BEFORE UPDATE ON seo_audit_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
