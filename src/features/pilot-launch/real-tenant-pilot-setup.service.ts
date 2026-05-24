/**
 * Product Phase 26-B — Real tenant pilot setup service.
 */
import { assembleRealTenantPilotSetup } from "./real-tenant-pilot-setup.policy";
import {
  REAL_TENANT_PILOT_DEFAULT_SLUG,
  REAL_TENANT_PILOT_STEPS,
} from "./real-tenant-pilot-setup.registry";
import type { RealTenantPilotSetupResult } from "./real-tenant-pilot-setup.schema";

export const REAL_TENANT_PILOT_SETUP_SERVICE_MARKER_PHASE26B =
  "phase26b-real-tenant-pilot-setup-service" as const;

export function buildRealTenantPilotSetupForSlug(input: {
  tenantSlug?: string;
  completedStepIds?: string[];
}): RealTenantPilotSetupResult {
  const slug = input.tenantSlug ?? REAL_TENANT_PILOT_DEFAULT_SLUG;
  const completedStepIds = new Set(input.completedStepIds ?? []);

  if (slug === REAL_TENANT_PILOT_DEFAULT_SLUG) {
    for (const stepId of ["provision-tenant", "assign-pilot-owner", "configure-commercial-plan"]) {
      completedStepIds.add(stepId);
    }
  }

  return assembleRealTenantPilotSetup({
    tenantSlug: slug,
    completedStepIds,
  });
}

export function getRealTenantPilotStepCount(): number {
  return REAL_TENANT_PILOT_STEPS.length;
}
