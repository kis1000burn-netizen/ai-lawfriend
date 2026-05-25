/**
 * Product Phase 36-D — Go-live success criteria policy SSOT.
 */
import { GO_LIVE_CRITERIA } from "./go-live-success-criteria.registry";
import type { GoLiveSuccessCriteriaResult } from "./go-live-success-criteria.schema";
import { GO_LIVE_SUCCESS_CRITERIA_VERSION } from "./go-live-success-criteria.schema";

export const GO_LIVE_SUCCESS_CRITERIA_POLICY_MARKER_PHASE36D =
  "phase36d-go-live-success-criteria-policy" as const;

export function assembleGoLiveSuccessCriteria(input: {
  implementationScopeSlug: string;
  definedCriterionIds: Set<string>;
  generatedAt?: string;
}): GoLiveSuccessCriteriaResult {
  const criteria = GO_LIVE_CRITERIA.map((criterion) => ({
    ...criterion,
    defined: input.definedCriterionIds.has(criterion.criterionId),
  }));

  const required = criteria.filter((criterion) => criterion.required);
  const definedRequired = required.filter((criterion) => criterion.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: GO_LIVE_SUCCESS_CRITERIA_VERSION,
    implementationScopeSlug: input.implementationScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    criteria,
    completionRate,
    goLiveSuccessCriteriaReady: definedRequired === required.length,
  };
}
