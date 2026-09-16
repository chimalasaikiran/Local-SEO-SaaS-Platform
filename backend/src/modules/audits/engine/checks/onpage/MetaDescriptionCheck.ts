import { AuditCheck, CrawlContext, CheckResult } from '../../types';
import { IssueSeverity, AuditType } from '../../../types';

export class MetaDescriptionCheck implements AuditCheck {
  code = 'META_DESC_ISSUE';
  category = 'On-page SEO';
  severity = IssueSeverity.HIGH;

  shouldRun(context: CrawlContext, auditType: AuditType): boolean {
    return context.statusCode >= 200 && context.statusCode < 300 && context.$ !== null;
  }

  run(context: CrawlContext): CheckResult[] {
    const issues: CheckResult[] = [];
    if (!context.$) return issues;

    const metas = context.$('meta[name="description" i]');
    const descText = metas.first().attr('content')?.trim();

    if (metas.length === 0 || !descText) {
      issues.push({
        code: 'META_DESC_MISSING',
        category: this.category,
        severity: IssueSeverity.HIGH,
        title: 'Missing Meta Description',
        description: 'The page does not have a meta description.',
        recommendation: 'Search engines may generate their own snippets when no useful description is provided. Add concise, page-specific meta descriptions where appropriate.',
        evidence: { metasFound: metas.length }
      });
      return issues;
    }

    if (metas.length > 1) {
      issues.push({
        code: 'MULTIPLE_META_DESC',
        category: this.category,
        severity: IssueSeverity.MEDIUM,
        title: 'Multiple Meta Descriptions',
        description: 'The page contains more than one meta description.',
        recommendation: 'Ensure there is only one meta description tag.',
        evidence: { metasFound: metas.length }
      });
    }

    if (descText.length < 50) {
      issues.push({
        code: 'META_DESC_TOO_SHORT',
        category: this.category,
        severity: IssueSeverity.INFO,
        title: 'Meta Description Too Short',
        description: `The meta description is unusually short (${descText.length} characters).`,
        recommendation: 'Expand the description to better summarize the page content (aim for 120-160 characters as a best practice).',
        evidence: { description: descText, length: descText.length }
      });
    } else if (descText.length > 180) {
      issues.push({
        code: 'META_DESC_TOO_LONG',
        category: this.category,
        severity: IssueSeverity.INFO,
        title: 'Meta Description Too Long',
        description: `The meta description is quite long (${descText.length} characters). It may be truncated in search results.`,
        recommendation: 'Keep descriptions under 160 characters as a general best practice.',
        evidence: { description: descText, length: descText.length }
      });
    }

    return issues;
  }
}
