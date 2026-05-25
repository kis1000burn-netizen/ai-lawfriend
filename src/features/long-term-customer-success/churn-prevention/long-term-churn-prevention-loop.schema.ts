/**
 * Product Phase 38-E — Long-term churn prevention loop schema (Zod SSOT).
 */
import { z } from "zod";

export const CHURN_PREVENTION_LOOP_SCHEMA_MARKER_PHASE38E =
  "phase38e-churn-prevention-loop-schema" as const;

export const CHURN_PREVENTION_LOOP_VERSION = "38-E.1" as const;

export const CHURN_PREVENTION_STEP_IDS = [
  "CHURN_RISK_SIGNALS",
  "HEALTH_SCORE_REVIEW",
  "SAVE_PLAY_EXECUTION",
  "EXECUTIVE_ESCALATION",
  "EXIT_INTERVIEW_TEMPLATE",
] as const;

export const churnPreventionStepSchema = z.object({
  stepId: z.enum(CHURN_PREVENTION_STEP_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const longTermChurnPreventionLoopResultSchema = z.object({
  version: z.literal(CHURN_PREVENTION_LOOP_VERSION),
  customerSuccessScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(churnPreventionStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  longTermChurnPreventionLoopReady: z.boolean(),
});

export type ChurnPreventionStepId = (typeof CHURN_PREVENTION_STEP_IDS)[number];
export type LongTermChurnPreventionLoopResult = z.infer<
  typeof longTermChurnPreventionLoopResultSchema
>;
