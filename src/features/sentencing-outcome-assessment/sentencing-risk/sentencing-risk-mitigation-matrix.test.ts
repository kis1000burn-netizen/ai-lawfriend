import { describe, expect, it } from "vitest";
import { buildSentencingRiskMitigationMatrix } from "./sentencing-risk-mitigation-matrix.service";

describe("sentencing-risk-mitigation-matrix (Phase 41-D)", () => {
  it("marks sentencingRiskMitigationMatrixReady when required items defined", () => {
    const result = buildSentencingRiskMitigationMatrix();
    expect(result.sentencingRiskMitigationMatrixReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    expect(result.clientVisibleBeforeReview).toBe(false);
    
  });
});
