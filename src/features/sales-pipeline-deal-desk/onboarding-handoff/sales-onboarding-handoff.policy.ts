/**
 * Product Phase 34-E — Sales-to-onboarding handoff policy SSOT.
 */
import { ONBOARDING_HANDOFF_STEPS } from "./sales-onboarding-handoff.registry";
import type { SalesToOnboardingHandoffResult } from "./sales-onboarding-handoff.schema";
import { SALES_ONBOARDING_HANDOFF_VERSION } from "./sales-onboarding-handoff.schema";

export const SALES_ONBOARDING_HANDOFF_POLICY_MARKER_PHASE34E =
  "phase34e-sales-onboarding-handoff-policy" as const;

export function assembleSalesToOnboardingHandoff(input: {
  pipelineScopeSlug: string;
  readyStepIds: Set<string>;
  generatedAt?: string;
}): SalesToOnboardingHandoffResult {
  const steps = ONBOARDING_HANDOFF_STEPS.map((step) => ({
    ...step,
    ready: input.readyStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const readyRequired = required.filter((step) => step.ready).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((readyRequired / required.length) * 100);

  return {
    version: SALES_ONBOARDING_HANDOFF_VERSION,
    pipelineScopeSlug: input.pipelineScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    onboardingHandoffReady: readyRequired === required.length,
  };
}
