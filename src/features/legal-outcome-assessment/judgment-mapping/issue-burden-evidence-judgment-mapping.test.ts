import { describe, expect, it } from "vitest";
import { buildIssueBurdenEvidenceJudgmentMapping } from "./issue-burden-evidence-judgment-mapping.service";

describe("issue-burden-evidence-judgment-mapping (Phase 40-C)", () => {
  it("marks issueBurdenEvidenceJudgmentMappingReady when required items defined", () => {
    const result = buildIssueBurdenEvidenceJudgmentMapping();
    expect(result.issueBurdenEvidenceJudgmentMappingReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    expect(result.sections?.[0]?.judgmentReferences.length).toBeGreaterThan(0);
  });
});
