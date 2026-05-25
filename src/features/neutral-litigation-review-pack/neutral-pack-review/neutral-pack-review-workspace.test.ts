import { describe, expect, it } from "vitest";
import { buildNeutralPackReviewWorkspace } from "./neutral-pack-review-workspace.service";

describe("neutral-pack-review-workspace (Phase 46-E)", () => {
  it("marks neutralPackReviewWorkspaceReady when required items defined", () => {
    const result = buildNeutralPackReviewWorkspace();
    expect(result.neutralPackReviewWorkspaceReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
