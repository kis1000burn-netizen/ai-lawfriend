/**
 * Product Phase 39-C — Multi-branch rollout playbook policy SSOT.
 */
import { MULTI_BRANCH_ROLLOUT_STEPS } from "./multi-branch-rollout-playbook.registry";
import type { MultiBranchRolloutPlaybookResult } from "./multi-branch-rollout-playbook.schema";
import { MULTI_BRANCH_ROLLOUT_VERSION } from "./multi-branch-rollout-playbook.schema";

export const MULTI_BRANCH_ROLLOUT_POLICY_MARKER_PHASE39C =
  "phase39c-multi-branch-rollout-policy" as const;

export function assembleMultiBranchRolloutPlaybook(input: {
  strategicAccountScopeSlug: string;
  definedStepIds: Set<string>;
  generatedAt?: string;
}): MultiBranchRolloutPlaybookResult {
  const steps = MULTI_BRANCH_ROLLOUT_STEPS.map((step) => ({
    ...step,
    defined: input.definedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const definedRequired = required.filter((step) => step.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: MULTI_BRANCH_ROLLOUT_VERSION,
    strategicAccountScopeSlug: input.strategicAccountScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    multiBranchRolloutPlaybookReady: definedRequired === required.length,
  };
}
