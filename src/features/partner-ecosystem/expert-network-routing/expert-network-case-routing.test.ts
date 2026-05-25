import { describe, expect, it } from "vitest";
import { buildExpertNetworkCaseRouting } from "./expert-network-case-routing.service";

describe("expert-network-case-routing (Phase 31-C)", () => {
  it("marks caseRoutingReady when required channels routable", () => {
    const result = buildExpertNetworkCaseRouting();
    expect(result.caseRoutingReady).toBe(true);
  });
});
