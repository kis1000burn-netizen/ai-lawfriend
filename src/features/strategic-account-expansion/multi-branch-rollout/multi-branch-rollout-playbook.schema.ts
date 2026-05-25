/**
 * Product Phase 39-C — Multi-branch rollout playbook schema (Zod SSOT).
 */
import { z } from "zod";

export const MULTI_BRANCH_ROLLOUT_SCHEMA_MARKER_PHASE39C =
  "phase39c-multi-branch-rollout-schema" as const;

export const MULTI_BRANCH_ROLLOUT_VERSION = "39-C.1" as const;

export const MULTI_BRANCH_ROLLOUT_STEP_IDS = [
  "BRANCH_READINESS_CHECK",
  "LOCAL_CONFIG_PLAN",
  "ROLLOUT_SEQUENCE",
  "TRAINING_LOCALIZATION",
  "BRANCH_GO_LIVE_GATE",
] as const;

export const multiBranchRolloutStepSchema = z.object({
  stepId: z.enum(MULTI_BRANCH_ROLLOUT_STEP_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const multiBranchRolloutPlaybookResultSchema = z.object({
  version: z.literal(MULTI_BRANCH_ROLLOUT_VERSION),
  strategicAccountScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(multiBranchRolloutStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  multiBranchRolloutPlaybookReady: z.boolean(),
});

export type MultiBranchRolloutStepId = (typeof MULTI_BRANCH_ROLLOUT_STEP_IDS)[number];
export type MultiBranchRolloutPlaybookResult = z.infer<
  typeof multiBranchRolloutPlaybookResultSchema
>;
