import { describe, expect, it } from "vitest";
import { buildLawyerCourtReadyReviewWorkspace } from "./lawyer-court-ready-review-workspace.service";

describe("lawyer-court-ready-review-workspace (Phase 44-E)", () => {
  it("marks lawyerCourtReadyReviewWorkspaceReady when required items defined", () => {
    const result = buildLawyerCourtReadyReviewWorkspace();
    expect(result.lawyerCourtReadyReviewWorkspaceReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
