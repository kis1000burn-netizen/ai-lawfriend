import { describe, expect, it } from "vitest";
import { buildProductionLaunchChecklist } from "./production-launch-checklist.service";
import { evaluateProductionLaunchChecklist } from "./production-launch-checklist.policy";
import { PRODUCTION_LAUNCH_CHECKLIST_ITEMS } from "./production-launch-checklist.registry";

describe("production-launch-checklist (Phase 25-A)", () => {
  it("defines launch checklist items", () => {
    expect(PRODUCTION_LAUNCH_CHECKLIST_ITEMS.length).toBeGreaterThanOrEqual(8);
    expect(PRODUCTION_LAUNCH_CHECKLIST_ITEMS.some((i) => i.itemId === "TENANT_RC")).toBe(true);
  });

  it("recommends GO when all required complete", () => {
    const result = evaluateProductionLaunchChecklist({
      completedItemIds: new Set(PRODUCTION_LAUNCH_CHECKLIST_ITEMS.map((i) => i.itemId)),
      rollbackTargetConfirmed: true,
      goNoGoDecision: "GO",
    });
    expect(result.goNoGoRecommendation).toBe("GO");
    expect(result.allRequiredComplete).toBe(true);
  });

  it("builds checklist with pending rollback by default", () => {
    const result = buildProductionLaunchChecklist();
    expect(result.items.find((i) => i.itemId === "ROLLBACK_TARGET")?.completed).toBe(false);
    expect(result.goNoGoRecommendation).not.toBe("GO");
  });
});
