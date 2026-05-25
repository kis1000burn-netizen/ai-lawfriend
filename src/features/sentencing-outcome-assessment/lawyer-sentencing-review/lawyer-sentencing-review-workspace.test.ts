import { describe, expect, it } from "vitest";
import { buildLawyerSentencingReviewWorkspace } from "./lawyer-sentencing-review-workspace.service";

describe("lawyer-sentencing-review-workspace (Phase 41-E)", () => {
  it("marks lawyerSentencingReviewWorkspaceReady when required items defined", () => {
    const result = buildLawyerSentencingReviewWorkspace();
    expect(result.lawyerSentencingReviewWorkspaceReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    expect(result.clientVisibleBeforeReview).toBe(false);
    
  });
});
