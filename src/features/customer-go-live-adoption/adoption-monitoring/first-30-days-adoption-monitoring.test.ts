import { describe, expect, it } from "vitest";
import { buildFirst30DaysAdoptionMonitoring } from "./first-30-days-adoption-monitoring.service";

describe("first-30-days-adoption-monitoring (Phase 37-B)", () => {
  it("marks first30DaysAdoptionMonitoringReady when required items defined", () => {
    const result = buildFirst30DaysAdoptionMonitoring();
    expect(result.first30DaysAdoptionMonitoringReady).toBe(true);
  });
});
