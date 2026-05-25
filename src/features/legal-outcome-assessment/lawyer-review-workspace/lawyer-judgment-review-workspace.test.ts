import { describe, expect, it } from "vitest";
import { buildLawyerJudgmentReviewWorkspace } from "./lawyer-judgment-review-workspace.service";

describe("lawyer-judgment-review-workspace (Phase 40-E)", () => {
  it("marks lawyerJudgmentReviewWorkspaceReady when required items defined", () => {
    const result = buildLawyerJudgmentReviewWorkspace();
    expect(result.lawyerJudgmentReviewWorkspaceReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    
  });
});
