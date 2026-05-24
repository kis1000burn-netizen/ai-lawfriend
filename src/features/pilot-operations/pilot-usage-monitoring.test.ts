import { describe, expect, it } from "vitest";
import { assemblePilotUsageMonitoring } from "./pilot-usage-monitoring.policy";
import { PILOT_USAGE_MONITORING_METRICS } from "./pilot-usage-monitoring.registry";
import { buildPilotUsageMonitoringSnapshot } from "./pilot-usage-monitoring.service";

describe("pilot-usage-monitoring (Phase 27-A)", () => {
  it("defines pilot usage metrics", () => {
    expect(PILOT_USAGE_MONITORING_METRICS.some((m) => m.metricId === "BILLING_EVENTS")).toBe(
      true,
    );
  });

  it("marks pilotUsageMonitoringReady when all observed", () => {
    const result = assemblePilotUsageMonitoring({
      tenantSlug: "pilot-lawfirm-001",
      observedMetricIds: new Set(PILOT_USAGE_MONITORING_METRICS.map((m) => m.metricId)),
    });
    expect(result.pilotUsageMonitoringReady).toBe(true);
  });

  it("defaults to observed when assumePilotUsageObserved", () => {
    const result = buildPilotUsageMonitoringSnapshot();
    expect(result.pilotUsageMonitoringReady).toBe(true);
  });
});
