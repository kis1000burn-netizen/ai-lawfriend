/**
 * Product Phase 38-C — Renewal readiness timeline policy SSOT.
 */
import { RENEWAL_READINESS_STEPS } from "./renewal-readiness-timeline.registry";
import type { RenewalReadinessTimelineResult } from "./renewal-readiness-timeline.schema";
import { RENEWAL_READINESS_TIMELINE_VERSION } from "./renewal-readiness-timeline.schema";

export const RENEWAL_READINESS_POLICY_MARKER_PHASE38C =
  "phase38c-renewal-readiness-policy" as const;

export function assembleRenewalReadinessTimeline(input: {
  customerSuccessScopeSlug: string;
  definedStepIds: Set<string>;
  generatedAt?: string;
}): RenewalReadinessTimelineResult {
  const steps = RENEWAL_READINESS_STEPS.map((step) => ({
    ...step,
    defined: input.definedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const definedRequired = required.filter((step) => step.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: RENEWAL_READINESS_TIMELINE_VERSION,
    customerSuccessScopeSlug: input.customerSuccessScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    renewalReadinessTimelineReady: definedRequired === required.length,
  };
}
