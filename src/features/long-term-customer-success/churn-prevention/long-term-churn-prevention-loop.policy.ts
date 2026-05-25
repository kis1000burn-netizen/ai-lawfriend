/**
 * Product Phase 38-E — Long-term churn prevention loop policy SSOT.
 */
import { CHURN_PREVENTION_STEPS } from "./long-term-churn-prevention-loop.registry";
import type { LongTermChurnPreventionLoopResult } from "./long-term-churn-prevention-loop.schema";
import { CHURN_PREVENTION_LOOP_VERSION } from "./long-term-churn-prevention-loop.schema";

export const CHURN_PREVENTION_POLICY_MARKER_PHASE38E = "phase38e-churn-prevention-policy" as const;

export function assembleLongTermChurnPreventionLoop(input: {
  customerSuccessScopeSlug: string;
  definedStepIds: Set<string>;
  generatedAt?: string;
}): LongTermChurnPreventionLoopResult {
  const steps = CHURN_PREVENTION_STEPS.map((step) => ({
    ...step,
    defined: input.definedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const definedRequired = required.filter((step) => step.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: CHURN_PREVENTION_LOOP_VERSION,
    customerSuccessScopeSlug: input.customerSuccessScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    longTermChurnPreventionLoopReady: definedRequired === required.length,
  };
}
