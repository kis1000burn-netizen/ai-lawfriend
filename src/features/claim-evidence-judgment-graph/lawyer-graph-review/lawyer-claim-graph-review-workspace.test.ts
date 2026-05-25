import { describe, expect, it } from "vitest";
import { buildLawyerClaimGraphReviewWorkspace } from "./lawyer-claim-graph-review-workspace.service";

describe("lawyer-claim-graph-review-workspace (Phase 43-E)", () => {
  it("marks lawyerClaimGraphReviewWorkspaceReady when required items defined", () => {
    const result = buildLawyerClaimGraphReviewWorkspace();
    expect(result.lawyerClaimGraphReviewWorkspaceReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    expect(result.sampleGraph?.edges.length).toBeGreaterThan(0);
  });
});
