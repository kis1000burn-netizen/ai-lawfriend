import { describe, expect, it } from "vitest";
import { buildScaleMonitoringCapacityForecast } from "./scale-monitoring-capacity-forecast.service";

describe("scale-monitoring-capacity-forecast (Phase 30-E)", () => {
  it("marks capacityForecastReady under utilization threshold", () => {
    const result = buildScaleMonitoringCapacityForecast();
    expect(result.capacityForecastReady).toBe(true);
  });
});
