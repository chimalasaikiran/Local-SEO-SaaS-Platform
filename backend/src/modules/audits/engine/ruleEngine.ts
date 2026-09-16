import { AuditCheck, CrawlContext, CheckResult } from './types';
import { AuditType } from '../types';

import { TitleCheck } from './checks/onpage/TitleCheck';
import { MetaDescriptionCheck } from './checks/onpage/MetaDescriptionCheck';
// Add more checks here as they are implemented

export class RuleEngine {
  private checks: AuditCheck[] = [];

  constructor() {
    this.registerChecks();
  }

  private registerChecks() {
    this.checks.push(new TitleCheck());
    this.checks.push(new MetaDescriptionCheck());
    // Register more here...
  }

  public async runAll(context: CrawlContext, auditType: AuditType): Promise<CheckResult[]> {
    let allIssues: CheckResult[] = [];

    for (const check of this.checks) {
      try {
        if (check.shouldRun(context, auditType)) {
          const result = await check.run(context);
          if (Array.isArray(result)) {
            allIssues = allIssues.concat(result);
          } else if (result) {
            allIssues.push(result);
          }
        }
      } catch (error) {
        console.error(`Error running check ${check.code} on ${context.url}:`, error);
      }
    }

    return allIssues;
  }
}
