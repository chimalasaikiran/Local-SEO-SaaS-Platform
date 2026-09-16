import * as cheerio from 'cheerio';
import robotsParser, { Robot } from 'robots-parser';
import { URL } from 'url';
import { CrawlContext, CheckResult } from './types';
import { validateSSRF } from './ssrf';
import { RuleEngine } from './ruleEngine';
import { AuditType } from '../types';

export interface CrawlerOptions {
  maxPages: number;
  maxDepth: number;
  userAgent?: string;
}

export class AuditCrawler {
  private visited = new Set<string>();
  private queue: { url: string; depth: number }[] = [];
  private robots: Robot | null = null;
  private ruleEngine = new RuleEngine();
  
  private options: CrawlerOptions;
  private baseUrl: string;

  constructor(targetUrl: string, options: Partial<CrawlerOptions> = {}) {
    this.baseUrl = new URL(targetUrl).origin;
    this.options = {
      maxPages: options.maxPages || 100,
      maxDepth: options.maxDepth || 3,
      userAgent: options.userAgent || 'OptivioBot/1.0 (+https://optivio.com)',
    };
  }

  private normalizeUrl(urlString: string): string | null {
    try {
      const url = new URL(urlString, this.baseUrl);
      // Only same domain
      if (url.origin !== this.baseUrl) return null;
      // Remove fragment
      url.hash = '';
      return url.toString();
    } catch (e) {
      return null;
    }
  }

  public async fetchRobotsTxt(): Promise<void> {
    const robotsUrl = `${this.baseUrl}/robots.txt`;
    
    // SSRF Check for robots.txt just in case
    const isSafe = await validateSSRF(robotsUrl);
    if (!isSafe) {
      throw new Error(`SSRF validation failed for ${robotsUrl}`);
    }

    try {
      const res = await fetch(robotsUrl, {
        headers: { 'User-Agent': this.options.userAgent! }
      });
      if (res.ok) {
        const text = await res.text();
        this.robots = robotsParser(robotsUrl, text);
      }
    } catch (e) {
      // Ignore if robots.txt fails to load, assume allowed
    }
  }

  public isAllowedByRobots(url: string): boolean {
    if (!this.robots) return true;
    return this.robots.isAllowed(url, this.options.userAgent) !== false;
  }

  /**
   * Main crawl generator that yields results per page so they can be saved to DB continuously
   */
  public async *crawl(startUrl: string, auditType: AuditType) {
    await this.fetchRobotsTxt();

    const normalizedStart = this.normalizeUrl(startUrl);
    if (!normalizedStart) throw new Error('Invalid start URL');

    this.queue.push({ url: normalizedStart, depth: 0 });
    this.visited.add(normalizedStart);

    let pagesCrawled = 0;

    while (this.queue.length > 0 && pagesCrawled < this.options.maxPages) {
      const current = this.queue.shift();
      if (!current) continue;

      const { url, depth } = current;

      // SSRF check before fetching
      if (!(await validateSSRF(url))) {
        continue;
      }

      const isRobotAllowed = this.isAllowedByRobots(url);
      
      let html = '';
      let statusCode = 0;
      let contentType = null;
      let headers: Record<string, string> = {};
      let $: cheerio.CheerioAPI | null = null;
      const startTime = Date.now();

      try {
        const res = await fetch(url, {
           headers: { 'User-Agent': this.options.userAgent! }
        });
        
        statusCode = res.status;
        contentType = res.headers.get('content-type');
        res.headers.forEach((v, k) => { headers[k] = v });

        // Only parse HTML
        if (contentType && contentType.includes('text/html')) {
          html = await res.text();
          $ = cheerio.load(html);
          
          // Enqueue internal links if within depth
          if (depth < this.options.maxDepth && $) {
            const links = $('a[href]');
            links.each((_, el) => {
              const href = $!(el).attr('href');
              if (href) {
                const normalized = this.normalizeUrl(href);
                if (normalized && !this.visited.has(normalized)) {
                  this.visited.add(normalized);
                  this.queue.push({ url: normalized, depth: depth + 1 });
                }
              }
            });
          }
        }
      } catch (e) {
        statusCode = 0;
        // Network error
      }

      const loadTimeMs = Date.now() - startTime;
      pagesCrawled++;

      const context: CrawlContext = {
        url,
        normalizedUrl: url,
        statusCode,
        contentType,
        html,
        $,
        loadTimeMs,
        headers,
        isRobotAllowed
      };

      const issues = await this.ruleEngine.runAll(context, auditType);

      yield { context, issues, pagesCrawled, pagesDiscovered: this.visited.size };
    }
  }
}
