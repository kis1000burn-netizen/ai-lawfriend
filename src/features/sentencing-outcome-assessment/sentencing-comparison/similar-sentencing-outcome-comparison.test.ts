import { describe, expect, it } from "vitest";
import { buildSimilarSentencingOutcomeComparison } from "./similar-sentencing-outcome-comparison.service";

describe("similar-sentencing-outcome-comparison (Phase 41-C)", () => {
  it("marks similarSentencingOutcomeComparisonReady when required items defined", () => {
    const result = buildSimilarSentencingOutcomeComparison();
    expect(result.similarSentencingOutcomeComparisonReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    expect(result.clientVisibleBeforeReview).toBe(false);
    expect(result.sections?.[0]?.sentencingOutcomeReferences.length).toBeGreaterThan(0);
  });
});
