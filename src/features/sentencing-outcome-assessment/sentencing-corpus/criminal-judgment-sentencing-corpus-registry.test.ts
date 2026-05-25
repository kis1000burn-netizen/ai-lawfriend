import { describe, expect, it } from "vitest";
import { buildCriminalJudgmentSentencingCorpusRegistry } from "./criminal-judgment-sentencing-corpus-registry.service";

describe("criminal-judgment-sentencing-corpus-registry (Phase 41-A)", () => {
  it("marks criminalJudgmentSentencingCorpusRegistryReady when required items defined", () => {
    const result = buildCriminalJudgmentSentencingCorpusRegistry();
    expect(result.criminalJudgmentSentencingCorpusRegistryReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    expect(result.clientVisibleBeforeReview).toBe(false);
    
  });
});
