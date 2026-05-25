import { describe, expect, it } from "vitest";
import { buildJudgmentCorpusSourceRegistry } from "./judgment-corpus-source-registry.service";

describe("judgment-corpus-source-registry (Phase 40-A)", () => {
  it("marks judgmentCorpusSourceRegistryReady when required items defined", () => {
    const result = buildJudgmentCorpusSourceRegistry();
    expect(result.judgmentCorpusSourceRegistryReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    
  });
});
