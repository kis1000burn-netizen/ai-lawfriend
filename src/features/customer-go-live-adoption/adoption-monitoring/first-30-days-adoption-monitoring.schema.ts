/**
 * Product Phase 37-B — First 30 days adoption monitoring schema (Zod SSOT).
 */
import { z } from "zod";

export const FIRST_30_DAYS_ADOPTION_SCHEMA_MARKER_PHASE37B =
  "phase37b-first-30-days-adoption-schema" as const;

export const FIRST_30_DAYS_ADOPTION_VERSION = "37-B.1" as const;

export const FIRST_30_DAYS_MONITORING_IDS = [
  "DAILY_HEALTH_CHECK",
  "ACTIVE_USER_TREND",
  "FEATURE_USAGE_BASELINE",
  "TRAINING_EFFECTIVENESS",
  "ADOPTION_RISK_FLAGS",
] as const;

export const first30DaysMonitoringItemSchema = z.object({
  monitoringId: z.enum(FIRST_30_DAYS_MONITORING_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const first30DaysAdoptionMonitoringResultSchema = z.object({
  version: z.literal(FIRST_30_DAYS_ADOPTION_VERSION),
  adoptionScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  monitoringItems: z.array(first30DaysMonitoringItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  first30DaysAdoptionMonitoringReady: z.boolean(),
});

export type First30DaysMonitoringId = (typeof FIRST_30_DAYS_MONITORING_IDS)[number];
export type First30DaysAdoptionMonitoringResult = z.infer<
  typeof first30DaysAdoptionMonitoringResultSchema
>;
