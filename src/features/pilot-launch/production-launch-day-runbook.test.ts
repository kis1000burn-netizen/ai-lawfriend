import { describe, expect, it } from "vitest";
import { assembleProductionLaunchDayRunbook } from "./production-launch-day-runbook.policy";
import { PRODUCTION_LAUNCH_DAY_MILESTONES } from "./production-launch-day-runbook.registry";
import { buildProductionLaunchDayRunbook } from "./production-launch-day-runbook.service";

describe("production-launch-day-runbook (Phase 26-E)", () => {
  it("defines launch day milestones", () => {
    expect(PRODUCTION_LAUNCH_DAY_MILESTONES.some((m) => m.milestoneId === "T_ZERO_DEPLOY")).toBe(
      true,
    );
  });

  it("marks launchDayReady when all milestones complete", () => {
    const result = assembleProductionLaunchDayRunbook({
      completedMilestoneIds: new Set(PRODUCTION_LAUNCH_DAY_MILESTONES.map((m) => m.milestoneId)),
      launchDate: "2026-06-01",
    });
    expect(result.launchDayReady).toBe(true);
  });

  it("defaults to incomplete milestones", () => {
    const result = buildProductionLaunchDayRunbook();
    expect(result.launchDayReady).toBe(false);
  });
});
