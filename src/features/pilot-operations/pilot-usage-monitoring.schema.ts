/**
 * Product Phase 27-A — Pilot usage monitoring schema (Zod SSOT).
 */
import { z } from "zod";

export const PILOT_USAGE_MONITORING_SCHEMA_MARKER_PHASE27A =
  "phase27a-pilot-usage-monitoring-schema" as const;

export const PILOT_USAGE_MONITORING_VERSION = "27-A.1" as const;

export const PILOT_USAGE_METRIC_IDS = [
  "ACTIVE_TENANTS",
  "ACTIVE_CASES",
  "AI_INTERVIEW_SESSIONS",
  "DOCUMENT_GENERATIONS",
  "CLIENT_NOTIFICATIONS",
  "BILLING_EVENTS",
] as const;

export const pilotUsageMetricSchema = z.object({
  metricId: z.enum(PILOT_USAGE_METRIC_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  adminPath: z.string().optional(),
  observed: z.boolean(),
  notes: z.array(z.string()).default([]),
});

export const pilotUsageMonitoringResultSchema = z.object({
  version: z.literal(PILOT_USAGE_MONITORING_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  metrics: z.array(pilotUsageMetricSchema).min(1),
  coverageRate: z.number().min(0).max(100),
  pilotUsageMonitoringReady: z.boolean(),
});

export type PilotUsageMetricId = (typeof PILOT_USAGE_METRIC_IDS)[number];
export type PilotUsageMonitoringResult = z.infer<typeof pilotUsageMonitoringResultSchema>;
