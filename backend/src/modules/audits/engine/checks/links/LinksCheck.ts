import { AuditCheck, CrawlContext, CheckResult } from '../../types';
import { IssueSeverity, AuditType } from '../../../types';

export class LinksCheck implements AuditCheck {
  code = 'LINKS_ISSUE';
  category = 'Links & Crawlability';
  severity = IssueSeverity.MEDIUM;

  shouldRun(context: CrawlContext, auditType: AuditType): boolean {
    return context.statusCode >= 200 && context.statusCode < 300 && context.$ !== null;
  }

  run(context: CrawlContext): CheckResult[] {
    const issues: CheckResult[] = [];
    if (!context.$) return issues;

    const links = context.$('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;
    const baseUrl = new URL(context.url).origin;

    links.each((_, el) => {
      const href = context.$!(el).attr('href');
      if (!href) return;
      try {
        const url = new URL(href, baseUrl);
        if (url.origin === baseUrl) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      } catch (e) {
        // invalid URL
      }
    });

    if (internalLinks === 0) {
      issues.push({
        code: 'NO_INTERNAL_LINKS',
        category: this.category,
        severity: IssueSeverity.MEDIUM,
        title: 'No Internal Links',
        description: 'This page has no internal links, making it a dead-end for users and crawlers.',
        recommendation: 'Add relevant internal links to help users navigate and to pass link equity.',
        evidence: { internalLinks, externalLinks }
      });
    }

    // High number of links (Google used to say > 100 is bad, now it's more relaxed, but still a signal)
    if (internalLinks + externalLinks > 400) {
       issues.push({
        code: 'EXCESSIVE_LINKS',
        category: this.category,
        severity: IssueSeverity.LOW,
        title: 'Excessive Links',
        description: `This page has a very high number of links (${internalLinks + externalLinks}).`,
        recommendation: 'Ensure that the large number of links provides a good user experience and isn\'t confusing.',
        evidence: { internalLinks, externalLinks, total: internalLinks + externalLinks }
      });
    }

    return issues;
  }
}
