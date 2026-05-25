/**
 * Product Phase 38-A — 90-day success plan schema (Zod SSOT).
 */
import { z } from "zod";

export const NINETY_DAY_SUCCESS_PLAN_SCHEMA_MARKER_PHASE38A =
  "phase38a-90-day-success-plan-schema" as const;

export const NINETY_DAY_SUCCESS_PLAN_VERSION = "38-A.1" as const;

export const NINETY_DAY_SUCCESS_MILESTONE_IDS = [
  "DAY_30_CHECKPOINT",
  "DAY_60_HEALTH_REVIEW",
  "DAY_90_SUCCESS_REVIEW",
  "OUTCOME_METRICS",
  "SUCCESS_PLAN_SIGNOFF",
] as const;

export const ninetyDaySuccessMilestoneSchema = z.object({
  milestoneId: z.enum(NINETY_DAY_SUCCESS_MILESTONE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const ninetyDaySuccessPlanResultSchema = z.object({
  version: z.literal(NINETY_DAY_SUCCESS_PLAN_VERSION),
  customerSuccessScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  milestones: z.array(ninetyDaySuccessMilestoneSchema).min(1),
  completionRate: z.number().min(0).max(100),
  ninetyDaySuccessPlanReady: z.boolean(),
});

export type NinetyDaySuccessMilestoneId = (typeof NINETY_DAY_SUCCESS_MILESTONE_IDS)[number];
export type NinetyDaySuccessPlanResult = z.infer<typeof ninetyDaySuccessPlanResultSchema>;
