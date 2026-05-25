import { describe, expect, it } from "vitest";
import { buildCaseSummaryPack } from "./case-summary-pack.service";

describe("case-summary-pack (Phase 44-A)", () => {
  it("marks caseSummaryPackReady when required items defined", () => {
    const result = buildCaseSummaryPack();
    expect(result.caseSummaryPackReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
