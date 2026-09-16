import { CheerioAPI } from 'cheerio';
import { IssueSeverity, AuditType } from '../types';

export interface CrawlContext {
  url: string;
  normalizedUrl: string;
  statusCode: number;
  contentType: string | null;
  html: string;
  $: CheerioAPI | null;
  loadTimeMs: number;
  headers: Record<string, string>;
  isRobotAllowed: boolean;
  businessData?: Record<string, any>; // Optional business data for Local SEO checks
  locationData?: Record<string, any>; // Optional location data for Local SEO checks
}

export interface CheckResult {
  code: string;
  category: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  recommendation: string;
  evidence: any;
}

export interface AuditCheck {
  code: string;
  category: string;
  severity: IssueSeverity;
  
  /**
   * Determine if the check should run for the given context
   */
  shouldRun(context: CrawlContext, auditType: AuditType): boolean;

  /**
   * Execute the check
   * @returns Array of issues found (empty if none)
   */
  run(context: CrawlContext): Promise<CheckResult[]> | CheckResult[];
}
