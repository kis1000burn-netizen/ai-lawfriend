import { describe, expect, it } from "vitest";
import { buildSentencingFactorExtraction } from "./sentencing-factor-extraction.service";

describe("sentencing-factor-extraction (Phase 41-B)", () => {
  it("marks sentencingFactorExtractionReady when required items defined", () => {
    const result = buildSentencingFactorExtraction();
    expect(result.sentencingFactorExtractionReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    expect(result.clientVisibleBeforeReview).toBe(false);
    
  });
});
