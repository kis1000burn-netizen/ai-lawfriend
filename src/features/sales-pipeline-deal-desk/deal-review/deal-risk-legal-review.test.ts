import { describe, expect, it } from "vitest";
import { buildDealRiskLegalReviewGate } from "./deal-risk-legal-review.service";

describe("deal-risk-legal-review (Phase 34-D)", () => {
  it("marks dealReviewGateReady when required gates cleared", () => {
    const result = buildDealRiskLegalReviewGate();
    expect(result.dealReviewGateReady).toBe(true);
  });
});
