/**
 * Product Phase 37-E — Go-live issue / change request loop service.
 */
import { CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG } from "../go-live-execution/go-live-execution-checklist.registry";
import { GO_LIVE_ISSUE_CHANGE_STEPS } from "./go-live-issue-change-request-loop.registry";
import { assembleGoLiveIssueChangeRequestLoop } from "./go-live-issue-change-request-loop.policy";
import type { GoLiveIssueChangeRequestLoopResult } from "./go-live-issue-change-request-loop.schema";

export const GO_LIVE_ISSUE_CHANGE_LOOP_SERVICE_MARKER_PHASE37E =
  "phase37e-go-live-issue-change-loop-service" as const;

export function buildGoLiveIssueChangeRequestLoop(input?: {
  adoptionScopeSlug?: string;
  definedStepIds?: string[];
}): GoLiveIssueChangeRequestLoopResult {
  const definedStepIds = new Set(
    input?.definedStepIds ??
      GO_LIVE_ISSUE_CHANGE_STEPS.filter((step) => step.required).map((step) => step.stepId),
  );

  return assembleGoLiveIssueChangeRequestLoop({
    adoptionScopeSlug: input?.adoptionScopeSlug ?? CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG,
    definedStepIds,
  });
}
