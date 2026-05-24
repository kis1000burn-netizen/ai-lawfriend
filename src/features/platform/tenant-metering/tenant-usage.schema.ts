/**
 * Product Phase 22-C — Tenant usage metering schema (Zod SSOT).
 */
import { z } from "zod";

export const TENANT_USAGE_SCHEMA_MARKER_PHASE22C =
  "phase22c-tenant-usage-schema" as const;

export const TENANT_USAGE_EVENT_KINDS = [
  "AI_TOKEN_USAGE",
  "LLM_CALL",
  "EXTERNAL_MESSAGE",
  "DOCUMENT_PROCESSING",
  "FILE_UPLOAD",
  "CLIENT_PORTAL_ACTIVE",
] as const;

export const TENANT_USAGE_EVENT_UNITS = ["COUNT", "TOKENS", "BYTES"] as const;

export const tenantUsageEventKindSchema = z.enum(TENANT_USAGE_EVENT_KINDS);
export const tenantUsageEventUnitSchema = z.enum(TENANT_USAGE_EVENT_UNITS);

export const recordTenantUsageEventInputSchema = z.object({
  tenantId: z.string().cuid(),
  kind: tenantUsageEventKindSchema,
  quantity: z.number().int().positive().default(1),
  unit: tenantUsageEventUnitSchema.default("COUNT"),
  caseId: z.string().cuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  recordedAt: z.date().optional(),
});

export const tenantUsageTotalsSchema = z.object({
  aiTokensUsed: z.number().int().nonnegative(),
  llmCallCount: z.number().int().nonnegative(),
  externalMessageCount: z.number().int().nonnegative(),
  documentProcessingCount: z.number().int().nonnegative(),
  fileUploadCount: z.number().int().nonnegative(),
  fileStorageBytesEstimate: z.number().int().nonnegative(),
  clientPortalActiveCount: z.number().int().nonnegative(),
});

export const tenantUsageLimitComparisonSchema = z.object({
  metric: z.string(),
  used: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  percentUsed: z.number().nonnegative(),
  overLimit: z.boolean(),
  warning: z.boolean(),
});

export const tenantUsageWarningSchema = z.object({
  code: z.string(),
  metric: z.string(),
  message: z.string(),
  severity: z.enum(["WARNING", "OVER_LIMIT"]),
  used: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

export const tenantUsageSummarySchema = z.object({
  tenantId: z.string().cuid(),
  periodKey: z.string().regex(/^\d{4}-\d{2}$/),
  totals: tenantUsageTotalsSchema,
  limitComparisons: z.array(tenantUsageLimitComparisonSchema),
  warnings: z.array(tenantUsageWarningSchema),
  billingLedgerSeparated: z.literal(true),
});

export type TenantUsageEventKind = z.infer<typeof tenantUsageEventKindSchema>;
export type TenantUsageEventUnit = z.infer<typeof tenantUsageEventUnitSchema>;
export type RecordTenantUsageEventInput = z.infer<typeof recordTenantUsageEventInputSchema>;
export type TenantUsageTotals = z.infer<typeof tenantUsageTotalsSchema>;
export type TenantUsageLimitComparison = z.infer<typeof tenantUsageLimitComparisonSchema>;
export type TenantUsageWarning = z.infer<typeof tenantUsageWarningSchema>;
export type TenantUsageSummary = z.infer<typeof tenantUsageSummarySchema>;

export type TenantCaseLlmUsageSummary = {
  caseId: string;
  llmCallCount: number;
};
