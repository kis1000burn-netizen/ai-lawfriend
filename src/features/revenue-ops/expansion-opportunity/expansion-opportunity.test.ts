import { describe, expect, it } from "vitest";
import { buildExpansionOpportunityTracker } from "./expansion-opportunity.service";

describe("expansion-opportunity (Phase 29-D)", () => {
  it("tracks opportunities above signal threshold", () => {
    const result = buildExpansionOpportunityTracker();
    expect(result.expansionTrackerReady).toBe(true);
    expect(result.topOpportunityId).toBeDefined();
  });
});
