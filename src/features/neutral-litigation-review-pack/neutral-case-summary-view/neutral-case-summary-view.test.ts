import { describe, expect, it } from "vitest";
import { buildNeutralCaseSummaryView } from "./neutral-case-summary-view.service";

describe("neutral-case-summary-view (Phase 46-A)", () => {
  it("marks neutralCaseSummaryViewReady when required items defined", () => {
    const result = buildNeutralCaseSummaryView();
    expect(result.neutralCaseSummaryViewReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
