import { describe, expect, it } from "vitest";
import { buildLeadOpportunityIntake } from "./lead-opportunity-intake.service";

describe("lead-opportunity-intake (Phase 34-B)", () => {
  it("marks leadOpportunityIntakeReady when required channels enabled", () => {
    const result = buildLeadOpportunityIntake();
    expect(result.leadOpportunityIntakeReady).toBe(true);
  });
});
