/**
 * Product Phase 38-C — Renewal readiness timeline service.
 */
import { LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG } from "../ninety-day-plan/ninety-day-success-plan.registry";
import { RENEWAL_READINESS_STEPS } from "./renewal-readiness-timeline.registry";
import { assembleRenewalReadinessTimeline } from "./renewal-readiness-timeline.policy";
import type { RenewalReadinessTimelineResult } from "./renewal-readiness-timeline.schema";

export const RENEWAL_READINESS_SERVICE_MARKER_PHASE38C =
  "phase38c-renewal-readiness-service" as const;

export function buildRenewalReadinessTimeline(input?: {
  customerSuccessScopeSlug?: string;
  definedStepIds?: string[];
}): RenewalReadinessTimelineResult {
  const definedStepIds = new Set(
    input?.definedStepIds ??
      RENEWAL_READINESS_STEPS.filter((step) => step.required).map((step) => step.stepId),
  );

  return assembleRenewalReadinessTimeline({
    customerSuccessScopeSlug:
      input?.customerSuccessScopeSlug ?? LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG,
    definedStepIds,
  });
}
