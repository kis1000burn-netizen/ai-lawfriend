/**
 * Product Phase 28-D — Sales / onboarding handoff pack service.
 */
import { PAID_CONVERSION_DEFAULT_TENANT } from "./paid-conversion-contract-pack.registry";
import { assembleSalesOnboardingHandoffPack } from "./sales-onboarding-handoff-pack.policy";
import { SALES_ONBOARDING_HANDOFF_STEPS } from "./sales-onboarding-handoff-pack.registry";
import type { SalesOnboardingHandoffPackResult } from "./sales-onboarding-handoff-pack.schema";

export const SALES_ONBOARDING_HANDOFF_PACK_SERVICE_MARKER_PHASE28D =
  "phase28d-sales-onboarding-handoff-pack-service" as const;

export function buildSalesOnboardingHandoffPack(input?: {
  tenantSlug?: string;
  completedStepIds?: string[];
}): SalesOnboardingHandoffPackResult {
  const completedStepIds = new Set(
    input?.completedStepIds ?? SALES_ONBOARDING_HANDOFF_STEPS.map((s) => s.stepId),
  );

  return assembleSalesOnboardingHandoffPack({
    tenantSlug: input?.tenantSlug ?? PAID_CONVERSION_DEFAULT_TENANT,
    completedStepIds,
  });
}
