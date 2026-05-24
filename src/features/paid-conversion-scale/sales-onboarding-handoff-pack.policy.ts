/**
 * Product Phase 28-D — Sales / onboarding handoff pack policy SSOT.
 */
import { SALES_ONBOARDING_HANDOFF_STEPS } from "./sales-onboarding-handoff-pack.registry";
import type { SalesOnboardingHandoffPackResult } from "./sales-onboarding-handoff-pack.schema";
import { SALES_ONBOARDING_HANDOFF_PACK_VERSION } from "./sales-onboarding-handoff-pack.schema";

export const SALES_ONBOARDING_HANDOFF_PACK_POLICY_MARKER_PHASE28D =
  "phase28d-sales-onboarding-handoff-pack-policy" as const;

export function assembleSalesOnboardingHandoffPack(input: {
  tenantSlug: string;
  completedStepIds: Set<string>;
  generatedAt?: string;
}): SalesOnboardingHandoffPackResult {
  const steps = SALES_ONBOARDING_HANDOFF_STEPS.map((step) => ({
    ...step,
    completed: input.completedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const completedRequired = required.filter((step) => step.completed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((completedRequired / required.length) * 100);

  return {
    version: SALES_ONBOARDING_HANDOFF_PACK_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    handoffPackReady: completedRequired === required.length,
  };
}
