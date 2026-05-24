import { describe, expect, it } from "vitest";
import { assembleRevenueAccountHealthScore } from "./account-health.policy";
import { ACCOUNT_HEALTH_METRICS } from "./account-health.registry";
import { buildRevenueAccountHealthScore } from "./account-health-score.service";

describe("account-health (Phase 29-A)", () => {
  it("computes weighted account health score", () => {
    const scores = Object.fromEntries(ACCOUNT_HEALTH_METRICS.map((m) => [m.metricId, 90]));
    const result = assembleRevenueAccountHealthScore({
      tenantSlug: "pilot-lawfirm-001",
      metricScores: scores,
    });
    expect(result.healthBand).toBe("HEALTHY");
    expect(result.accountHealthScore).toBeGreaterThanOrEqual(80);
  });

  it("defaults to healthy band when assumeHealthyTenant", () => {
    const result = buildRevenueAccountHealthScore();
    expect(result.healthBand).toBe("HEALTHY");
  });
});
