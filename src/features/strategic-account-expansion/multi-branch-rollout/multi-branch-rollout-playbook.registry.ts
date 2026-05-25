/**
 * Product Phase 39-C — Multi-branch rollout playbook SSOT.
 */
import type { MultiBranchRolloutPlaybookResult } from "./multi-branch-rollout-playbook.schema";

export const MULTI_BRANCH_ROLLOUT_REGISTRY_MARKER_PHASE39C =
  "phase39c-multi-branch-rollout-registry" as const;

type MultiBranchRolloutStep = Omit<MultiBranchRolloutPlaybookResult["steps"][number], "defined">;

export const MULTI_BRANCH_ROLLOUT_STEPS: MultiBranchRolloutStep[] = [
  { stepId: "BRANCH_READINESS_CHECK", label: "Branch readiness checklist", required: true },
  { stepId: "LOCAL_CONFIG_PLAN", label: "Local configuration plan", required: true },
  { stepId: "ROLLOUT_SEQUENCE", label: "Rollout sequence timeline", required: true },
  { stepId: "TRAINING_LOCALIZATION", label: "Training localization plan", required: true },
  { stepId: "BRANCH_GO_LIVE_GATE", label: "Branch go-live gate criteria", required: true },
];
