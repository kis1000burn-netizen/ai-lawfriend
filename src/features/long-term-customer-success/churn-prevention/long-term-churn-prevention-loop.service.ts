/**
 * Product Phase 38-E — Long-term churn prevention loop service.
 */
import { LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG } from "../ninety-day-plan/ninety-day-success-plan.registry";
import { CHURN_PREVENTION_STEPS } from "./long-term-churn-prevention-loop.registry";
import { assembleLongTermChurnPreventionLoop } from "./long-term-churn-prevention-loop.policy";
import type { LongTermChurnPreventionLoopResult } from "./long-term-churn-prevention-loop.schema";

export const CHURN_PREVENTION_SERVICE_MARKER_PHASE38E = "phase38e-churn-prevention-service" as const;

export function buildLongTermChurnPreventionLoop(input?: {
  customerSuccessScopeSlug?: string;
  definedStepIds?: string[];
}): LongTermChurnPreventionLoopResult {
  const definedStepIds = new Set(
    input?.definedStepIds ??
      CHURN_PREVENTION_STEPS.filter((step) => step.required).map((step) => step.stepId),
  );

  return assembleLongTermChurnPreventionLoop({
    customerSuccessScopeSlug:
      input?.customerSuccessScopeSlug ?? LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG,
    definedStepIds,
  });
}
