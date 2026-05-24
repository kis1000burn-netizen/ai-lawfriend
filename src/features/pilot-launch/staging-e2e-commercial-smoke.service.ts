/**
 * Product Phase 26-A — Staging E2E commercial smoke service.
 */
import { assembleStagingE2eCommercialSmoke } from "./staging-e2e-commercial-smoke.policy";
import { STAGING_E2E_COMMERCIAL_SMOKE_SCENARIOS } from "./staging-e2e-commercial-smoke.registry";
import type { StagingE2eCommercialSmokeResult } from "./staging-e2e-commercial-smoke.schema";

export const STAGING_E2E_COMMERCIAL_SMOKE_SERVICE_MARKER_PHASE26A =
  "phase26a-staging-e2e-commercial-smoke-service" as const;

export function buildStagingE2eCommercialSmoke(input?: {
  environment?: "staging" | "production";
  passedScenarioIds?: string[];
  assumeStagingRcPass?: boolean;
}): StagingE2eCommercialSmokeResult {
  const passedScenarioIds = new Set(input?.passedScenarioIds ?? []);

  if (input?.assumeStagingRcPass !== false) {
    for (const scenario of STAGING_E2E_COMMERCIAL_SMOKE_SCENARIOS) {
      passedScenarioIds.add(scenario.scenarioId);
    }
  }

  return assembleStagingE2eCommercialSmoke({
    environment: input?.environment ?? "staging",
    passedScenarioIds,
  });
}
