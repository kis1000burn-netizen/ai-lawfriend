import { describe, expect, it } from "vitest";
import { buildAiExtractToSourceLinkage } from "./ai-extract-to-source-linkage.service";

describe("ai-extract-to-source-linkage (Phase 42-C)", () => {
  it("marks aiExtractToSourceLinkageReady when required items defined", () => {
    const result = buildAiExtractToSourceLinkage();
    expect(result.aiExtractToSourceLinkageReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    expect(result.sampleIntegrityRecord?.aiExtractLinks[0]?.replacesOriginal).toBe(false);
  });
});
