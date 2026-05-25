import { describe, expect, it } from "vitest";
import { buildProposalQuoteDeskPolicy } from "./proposal-quote-desk.service";

describe("proposal-quote-desk (Phase 34-C)", () => {
  it("marks quoteDeskPolicyReady when required rules defined", () => {
    const result = buildProposalQuoteDeskPolicy();
    expect(result.quoteDeskPolicyReady).toBe(true);
  });
});
