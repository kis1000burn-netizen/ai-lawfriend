/**
 * Product Phase 26-A — Staging E2E commercial smoke policy SSOT.
 */
import { STAGING_E2E_COMMERCIAL_SMOKE_SCENARIOS } from "./staging-e2e-commercial-smoke.registry";
import type { StagingE2eCommercialSmokeResult } from "./staging-e2e-commercial-smoke.schema";
import { STAGING_E2E_COMMERCIAL_SMOKE_VERSION } from "./staging-e2e-commercial-smoke.schema";

export const STAGING_E2E_COMMERCIAL_SMOKE_POLICY_MARKER_PHASE26A =
  "phase26a-staging-e2e-commercial-smoke-policy" as const;

export function assembleStagingE2eCommercialSmoke(input: {
  environment: "staging" | "production";
  passedScenarioIds: Set<string>;
  generatedAt?: string;
}): StagingE2eCommercialSmokeResult {
  const scenarios = STAGING_E2E_COMMERCIAL_SMOKE_SCENARIOS.map((scenario) => {
    const passed = input.passedScenarioIds.has(scenario.scenarioId);
    return {
      ...scenario,
      passed,
      notes: passed ? [] : [`pending: ${scenario.scenarioId}`],
    };
  });

  const required = scenarios.filter((scenario) => scenario.required);
  const passedRequired = required.filter((scenario) => scenario.passed).length;
  const passRate =
    required.length === 0 ? 100 : Math.round((passedRequired / required.length) * 100);

  return {
    version: STAGING_E2E_COMMERCIAL_SMOKE_VERSION,
    environment: input.environment,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    scenarios,
    passRate,
    stagingCommercialReady: passedRequired === required.length,
  };
}
