import { AuditCheck, CrawlContext, CheckResult } from '../../types';
import { IssueSeverity, AuditType } from '../../../types';

export class TitleCheck implements AuditCheck {
  code = 'TITLE_ISSUE';
  category = 'On-page SEO';
  severity = IssueSeverity.HIGH;

  shouldRun(context: CrawlContext, auditType: AuditType): boolean {
    return context.statusCode >= 200 && context.statusCode < 300 && context.$ !== null;
  }

  run(context: CrawlContext): CheckResult[] {
    const issues: CheckResult[] = [];
    if (!context.$) return issues;

    const titles = context.$('title');
    const titleText = titles.first().text().trim();

    if (titles.length === 0 || !titleText) {
      issues.push({
        code: 'TITLE_MISSING',
        category: this.category,
        severity: IssueSeverity.CRITICAL,
        title: 'Missing Title Tag',
        description: 'The page does not have a <title> tag or it is empty.',
        recommendation: 'Add a descriptive and concise title tag to every page.',
        evidence: { titlesFound: titles.length }
      });
      return issues; // Skip other title checks if missing
    }

    if (titles.length > 1) {
      issues.push({
        code: 'MULTIPLE_TITLES',
        category: this.category,
        severity: IssueSeverity.MEDIUM,
        title: 'Multiple Title Tags',
        description: 'The page contains more than one <title> tag.',
        recommendation: 'Ensure there is only one <title> tag in the <head> section.',
        evidence: { titlesFound: titles.length }
      });
    }

    if (titleText.length < 10) {
      issues.push({
        code: 'TITLE_TOO_SHORT',
        category: this.category,
        severity: IssueSeverity.LOW,
        title: 'Title Too Short',
        description: `The page title is unusually short (${titleText.length} characters).`,
        recommendation: 'Expand the title to provide more context about the page content.',
        evidence: { title: titleText, length: titleText.length }
      });
    } else if (titleText.length > 70) {
      issues.push({
        code: 'TITLE_TOO_LONG',
        category: this.category,
        severity: IssueSeverity.LOW,
        title: 'Title Too Long',
        description: `The page title is quite long (${titleText.length} characters). It may be truncated in search results.`,
        recommendation: 'Keep titles under 60-70 characters as a general best practice.',
        evidence: { title: titleText, length: titleText.length }
      });
    }

    return issues;
  }
}
