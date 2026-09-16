export enum AuditType {
  FULL_AUDIT = 'FULL_AUDIT',
  TECHNICAL_AUDIT = 'TECHNICAL_AUDIT',
  LOCAL_AUDIT = 'LOCAL_AUDIT',
  PAGE_AUDIT = 'PAGE_AUDIT',
}

export enum AuditStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum IssueSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IGNORED = 'IGNORED',
  RESOLVED = 'RESOLVED',
}

export interface SeoAudit {
  id: string;
  organization_id: string;
  business_id: string;
  location_id: string | null;
  type: AuditType;
  target_url: string;
  status: AuditStatus;
  score: number | null;
  score_version: string;
  pages_discovered: number;
  pages_crawled: number;
  issues_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SeoAuditPage {
  id: string;
  organization_id: string;
  audit_id: string;
  url: string;
  normalized_url: string;
  status_code: number | null;
  content_type: string | null;
  title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots_directive: string | null;
  word_count: number;
  h1_count: number;
  h2_count: number;
  internal_links_count: number;
  external_links_count: number;
  image_count: number;
  images_missing_alt: number;
  load_time_ms: number | null;
  crawled_at: Date | null;
  created_at: Date;
}

export interface SeoAuditIssue {
  id: string;
  organization_id: string;
  audit_id: string;
  page_id: string | null;
  check_code: string;
  category: string;
  severity: IssueSeverity;
  title: string;
  description: string | null;
  recommendation: string | null;
  evidence: any | null;
  status: IssueStatus;
  created_at: Date;
  updated_at: Date;
}
