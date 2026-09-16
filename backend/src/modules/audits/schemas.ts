import { z } from 'zod';
import { AuditType, IssueSeverity, IssueStatus } from './types';

export const createAuditSchema = z.object({
  business_id: z.string().uuid(),
  location_id: z.string().uuid().optional(),
  type: z.nativeEnum(AuditType),
  target_url: z.string().url(),
  max_pages: z.number().int().min(1).max(10000).optional().default(100),
  crawl_depth: z.number().int().min(1).max(10).optional().default(3),
});

export const updateIssueSchema = z.object({
  status: z.nativeEnum(IssueStatus),
});

export const getIssuesQuerySchema = z.object({
  severity: z.nativeEnum(IssueSeverity).optional(),
  category: z.string().optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
});
