import { describe, expect, it } from "vitest";
import { assembleRenewalChurnRiskMonitor } from "./renewal-churn-risk.policy";
import { buildRenewalChurnRiskMonitor } from "./renewal-churn-risk.service";

describe("renewal-churn-risk (Phase 29-C)", () => {
  it("classifies CRITICAL when many signals active", () => {
    const result = assembleRenewalChurnRiskMonitor({
      tenantSlug: "pilot-lawfirm-001",
      activeSignalIds: new Set([
        "USAGE_DROP",
        "SLA_ISSUES",
        "OPEN_INCIDENTS",
        "NEGATIVE_FEEDBACK",
        "RENEWAL_IMMINENT",
      ]),
    });
    expect(result.riskLevel).toBe("CRITICAL");
    expect(result.recommendedActions.length).toBeGreaterThan(0);
  });

  it("defaults to LOW risk", () => {
    const result = buildRenewalChurnRiskMonitor();
    expect(result.riskLevel).toBe("LOW");
    expect(result.churnMonitorReady).toBe(true);
  });
});
