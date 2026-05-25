import { describe, expect, it } from "vitest";
import { build90DaySuccessPlan } from "./ninety-day-success-plan.service";

describe("ninety-day-success-plan (Phase 38-A)", () => {
  it("marks ninetyDaySuccessPlanReady when required milestones defined", () => {
    const result = build90DaySuccessPlan();
    expect(result.ninetyDaySuccessPlanReady).toBe(true);
  });
});
