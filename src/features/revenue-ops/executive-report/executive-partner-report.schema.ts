/**
 * Product Phase 29-E — Executive / partner success report schema (Zod SSOT).
 */
import { z } from "zod";

export const EXECUTIVE_PARTNER_REPORT_SCHEMA_MARKER_PHASE29E =
  "phase29e-executive-partner-report-schema" as const;

export const EXECUTIVE_PARTNER_REPORT_VERSION = "29-E.1" as const;

export const executiveReportMetricSchema = z.object({
  metricKey: z.string().min(1),
  label: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
});

export const executivePartnerSuccessReportResultSchema = z.object({
  version: z.literal(EXECUTIVE_PARTNER_REPORT_VERSION),
  tenantSlug: z.string().min(1),
  reportPeriod: z.string().min(1),
  generatedAt: z.string().datetime(),
  metrics: z.array(executiveReportMetricSchema).min(1),
  improvementSuggestions: z.array(z.string()),
  aggregateOnly: z.literal(true),
  piiRedacted: z.literal(true),
  executiveReportReady: z.boolean(),
});

export type ExecutivePartnerSuccessReportResult = z.infer<
  typeof executivePartnerSuccessReportResultSchema
>;
