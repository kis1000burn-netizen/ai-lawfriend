import { describe, expect, it } from "vitest";
import { buildClaimEvidenceJudgmentGraphWorkspace } from "./claim-graph-workspace.service";

describe("claim-graph-workspace (Phase 48-C)", () => {
  it("marks claimEvidenceJudgmentGraphWorkspaceReady when required items defined", () => {
    const result = buildClaimEvidenceJudgmentGraphWorkspace();
    expect(result.claimEvidenceJudgmentGraphWorkspaceReady).toBe(true);
    expect(result.uiRoute).toContain("lawyer-workbench");
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
