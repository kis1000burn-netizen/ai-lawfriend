/**
 * Product Phase 39-C — Multi-branch rollout playbook service.
 */
import { STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG } from "../account-plan/strategic-account-plan.registry";
import { MULTI_BRANCH_ROLLOUT_STEPS } from "./multi-branch-rollout-playbook.registry";
import { assembleMultiBranchRolloutPlaybook } from "./multi-branch-rollout-playbook.policy";
import type { MultiBranchRolloutPlaybookResult } from "./multi-branch-rollout-playbook.schema";

export const MULTI_BRANCH_ROLLOUT_SERVICE_MARKER_PHASE39C =
  "phase39c-multi-branch-rollout-service" as const;

export function buildMultiBranchRolloutPlaybook(input?: {
  strategicAccountScopeSlug?: string;
  definedStepIds?: string[];
}): MultiBranchRolloutPlaybookResult {
  const definedStepIds = new Set(
    input?.definedStepIds ??
      MULTI_BRANCH_ROLLOUT_STEPS.filter((step) => step.required).map((step) => step.stepId),
  );

  return assembleMultiBranchRolloutPlaybook({
    strategicAccountScopeSlug:
      input?.strategicAccountScopeSlug ?? STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG,
    definedStepIds,
  });
}
