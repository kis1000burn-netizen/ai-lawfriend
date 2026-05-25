import { describe, expect, it } from "vitest";
import { buildStrategyConfidentialMaterialExclusionPolicy } from "./strategy-confidential-material-exclusion-policy.service";

describe("strategy-confidential-material-exclusion-policy (Phase 46-B)", () => {
  it("marks strategyConfidentialMaterialExclusionPolicyReady when required items defined", () => {
    const result = buildStrategyConfidentialMaterialExclusionPolicy();
    expect(result.strategyConfidentialMaterialExclusionPolicyReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
