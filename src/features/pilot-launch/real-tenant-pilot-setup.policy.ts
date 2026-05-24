/**
 * Product Phase 26-B — Real tenant pilot setup policy SSOT.
 */
import { REAL_TENANT_PILOT_STEPS } from "./real-tenant-pilot-setup.registry";
import type { RealTenantPilotSetupResult } from "./real-tenant-pilot-setup.schema";
import { REAL_TENANT_PILOT_SETUP_VERSION } from "./real-tenant-pilot-setup.schema";

export const REAL_TENANT_PILOT_SETUP_POLICY_MARKER_PHASE26B =
  "phase26b-real-tenant-pilot-setup-policy" as const;

export function assembleRealTenantPilotSetup(input: {
  tenantSlug: string;
  completedStepIds: Set<string>;
  generatedAt?: string;
}): RealTenantPilotSetupResult {
  const steps = REAL_TENANT_PILOT_STEPS.map((step) => ({
    ...step,
    completed: input.completedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const completedRequired = required.filter((step) => step.completed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((completedRequired / required.length) * 100);

  return {
    version: REAL_TENANT_PILOT_SETUP_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    pilotTenantReady: completedRequired === required.length,
  };
}
