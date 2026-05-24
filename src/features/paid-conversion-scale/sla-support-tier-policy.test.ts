import { describe, expect, it } from "vitest";
import { buildSlaSupportTierPolicy } from "./sla-support-tier-policy.service";

describe("sla-support-tier-policy (Phase 28-C)", () => {
  it("marks slaPolicyReady when selected tier configured", () => {
    const result = buildSlaSupportTierPolicy({ selectedTierId: "ENTERPRISE" });
    expect(result.slaPolicyReady).toBe(true);
  });

  it("blocks ready when selected tier not configured", () => {
    const result = buildSlaSupportTierPolicy({
      selectedTierId: "ENTERPRISE",
      configuredTierIds: ["STANDARD"],
    });
    expect(result.slaPolicyReady).toBe(false);
  });
});
