import { describe, expect, it } from "vitest";
import { assembleStagingE2eCommercialSmoke } from "./staging-e2e-commercial-smoke.policy";
import { STAGING_E2E_COMMERCIAL_SMOKE_SCENARIOS } from "./staging-e2e-commercial-smoke.registry";
import { buildStagingE2eCommercialSmoke } from "./staging-e2e-commercial-smoke.service";

describe("staging-e2e-commercial-smoke (Phase 26-A)", () => {
  it("defines commercial smoke scenarios", () => {
    expect(STAGING_E2E_COMMERCIAL_SMOKE_SCENARIOS.length).toBeGreaterThanOrEqual(6);
    expect(
      STAGING_E2E_COMMERCIAL_SMOKE_SCENARIOS.some((s) => s.scenarioId === "BILLING_METER"),
    ).toBe(true);
  });

  it("marks stagingCommercialReady when all required pass", () => {
    const result = assembleStagingE2eCommercialSmoke({
      environment: "staging",
      passedScenarioIds: new Set(
        STAGING_E2E_COMMERCIAL_SMOKE_SCENARIOS.map((s) => s.scenarioId),
      ),
    });
    expect(result.stagingCommercialReady).toBe(true);
    expect(result.passRate).toBe(100);
  });

  it("defaults to all-pass when assumeStagingRcPass", () => {
    const result = buildStagingE2eCommercialSmoke();
    expect(result.stagingCommercialReady).toBe(true);
  });
});
