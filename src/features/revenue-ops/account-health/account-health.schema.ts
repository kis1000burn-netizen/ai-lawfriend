/**
 * Product Phase 29-A — Revenue account health score schema (Zod SSOT).
 */
import { z } from "zod";

export const ACCOUNT_HEALTH_SCHEMA_MARKER_PHASE29A = "phase29a-account-health-schema" as const;

export const ACCOUNT_HEALTH_VERSION = "29-A.1" as const;

export const ACCOUNT_HEALTH_METRIC_IDS = [
  "USAGE_VOLUME",
  "ACTIVE_USERS",
  "CASES_CREATED",
  "CLIENT_PORTAL_USAGE",
  "AI_FEATURE_USAGE",
  "MESSAGING_SUCCESS_RATE",
  "SUPPORT_REQUESTS",
  "INCIDENT_FREQUENCY",
  "SLA_VIOLATIONS",
  "SATISFACTION",
  "RENEWAL_PROXIMITY",
] as const;

export const accountHealthMetricSchema = z.object({
  metricId: z.enum(ACCOUNT_HEALTH_METRIC_IDS),
  label: z.string().min(1),
  weight: z.number().min(0).max(100),
  score: z.number().min(0).max(100),
});

export const revenueAccountHealthResultSchema = z.object({
  version: z.literal(ACCOUNT_HEALTH_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  metrics: z.array(accountHealthMetricSchema).min(1),
  accountHealthScore: z.number().min(0).max(100),
  healthBand: z.enum(["HEALTHY", "WATCH", "AT_RISK"]),
});

export type AccountHealthMetricId = (typeof ACCOUNT_HEALTH_METRIC_IDS)[number];
export type RevenueAccountHealthResult = z.infer<typeof revenueAccountHealthResultSchema>;
