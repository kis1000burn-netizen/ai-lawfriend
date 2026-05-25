/**
 * Product Phase 36-D — Go-live success criteria service.
 */
import { IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG } from "../project-plan/implementation-project-plan.registry";
import { GO_LIVE_CRITERIA } from "./go-live-success-criteria.registry";
import { assembleGoLiveSuccessCriteria } from "./go-live-success-criteria.policy";
import type { GoLiveSuccessCriteriaResult } from "./go-live-success-criteria.schema";

export const GO_LIVE_SUCCESS_CRITERIA_SERVICE_MARKER_PHASE36D =
  "phase36d-go-live-success-criteria-service" as const;

export function buildGoLiveSuccessCriteria(input?: {
  implementationScopeSlug?: string;
  definedCriterionIds?: string[];
}): GoLiveSuccessCriteriaResult {
  const definedCriterionIds = new Set(
    input?.definedCriterionIds ??
      GO_LIVE_CRITERIA.filter((criterion) => criterion.required).map(
        (criterion) => criterion.criterionId,
      ),
  );

  return assembleGoLiveSuccessCriteria({
    implementationScopeSlug:
      input?.implementationScopeSlug ?? IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG,
    definedCriterionIds,
  });
}
