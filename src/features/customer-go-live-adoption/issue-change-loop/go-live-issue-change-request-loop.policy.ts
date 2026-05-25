/**
 * Product Phase 37-E — Go-live issue / change request loop policy SSOT.
 */
import { GO_LIVE_ISSUE_CHANGE_STEPS } from "./go-live-issue-change-request-loop.registry";
import type { GoLiveIssueChangeRequestLoopResult } from "./go-live-issue-change-request-loop.schema";
import { GO_LIVE_ISSUE_CHANGE_LOOP_VERSION } from "./go-live-issue-change-request-loop.schema";

export const GO_LIVE_ISSUE_CHANGE_LOOP_POLICY_MARKER_PHASE37E =
  "phase37e-go-live-issue-change-loop-policy" as const;

export function assembleGoLiveIssueChangeRequestLoop(input: {
  adoptionScopeSlug: string;
  definedStepIds: Set<string>;
  generatedAt?: string;
}): GoLiveIssueChangeRequestLoopResult {
  const steps = GO_LIVE_ISSUE_CHANGE_STEPS.map((step) => ({
    ...step,
    defined: input.definedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const definedRequired = required.filter((step) => step.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: GO_LIVE_ISSUE_CHANGE_LOOP_VERSION,
    adoptionScopeSlug: input.adoptionScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    goLiveIssueChangeLoopReady: definedRequired === required.length,
  };
}
