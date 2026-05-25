/**
 * Product Phase 36-D — Go-live success criteria schema (Zod SSOT).
 */
import { z } from "zod";

export const GO_LIVE_SUCCESS_CRITERIA_SCHEMA_MARKER_PHASE36D =
  "phase36d-go-live-success-criteria-schema" as const;

export const GO_LIVE_SUCCESS_CRITERIA_VERSION = "36-D.1" as const;

export const GO_LIVE_CRITERION_IDS = [
  "FUNCTIONAL_ACCEPTANCE",
  "PERFORMANCE_BASELINE",
  "SECURITY_CHECKLIST",
  "OPERATIONS_HANDOFF",
  "CUSTOMER_SIGNOFF",
] as const;

export const goLiveCriterionSchema = z.object({
  criterionId: z.enum(GO_LIVE_CRITERION_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const goLiveSuccessCriteriaResultSchema = z.object({
  version: z.literal(GO_LIVE_SUCCESS_CRITERIA_VERSION),
  implementationScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  criteria: z.array(goLiveCriterionSchema).min(1),
  completionRate: z.number().min(0).max(100),
  goLiveSuccessCriteriaReady: z.boolean(),
});

export type GoLiveCriterionId = (typeof GO_LIVE_CRITERION_IDS)[number];
export type GoLiveSuccessCriteriaResult = z.infer<typeof goLiveSuccessCriteriaResultSchema>;
