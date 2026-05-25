/**
 * Product Phase 34-E — Sales-to-onboarding handoff service.
 */
import { SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG } from "../sales-pipeline/sales-pipeline-model.registry";
import { ONBOARDING_HANDOFF_STEPS } from "./sales-onboarding-handoff.registry";
import { assembleSalesToOnboardingHandoff } from "./sales-onboarding-handoff.policy";
import type { SalesToOnboardingHandoffResult } from "./sales-onboarding-handoff.schema";

export const SALES_ONBOARDING_HANDOFF_SERVICE_MARKER_PHASE34E =
  "phase34e-sales-onboarding-handoff-service" as const;

export function buildSalesToOnboardingHandoff(input?: {
  pipelineScopeSlug?: string;
  readyStepIds?: string[];
}): SalesToOnboardingHandoffResult {
  const readyStepIds = new Set(
    input?.readyStepIds ??
      ONBOARDING_HANDOFF_STEPS.filter((step) => step.required).map((step) => step.stepId),
  );

  return assembleSalesToOnboardingHandoff({
    pipelineScopeSlug: input?.pipelineScopeSlug ?? SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG,
    readyStepIds,
  });
}
