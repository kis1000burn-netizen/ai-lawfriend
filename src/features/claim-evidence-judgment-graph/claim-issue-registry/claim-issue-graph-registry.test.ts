import { describe, expect, it } from "vitest";
import { buildClaimIssueGraphRegistry } from "./claim-issue-graph-registry.service";

describe("claim-issue-graph-registry (Phase 43-A)", () => {
  it("marks claimIssueGraphRegistryReady when required items defined", () => {
    const result = buildClaimIssueGraphRegistry();
    expect(result.claimIssueGraphRegistryReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    
  });
});
