import { describe, expect, it } from "vitest";

import {
  AI_GOVERNANCE_VALIDATOR_MARKER,
  validateAiGovernanceControlMatrix,
} from "./ai-governance-validator";
import { resolveDefaultAiGovernanceControlMatrix } from "./ai-governance-policy.service";

describe("ai-governance-validator Phase 10-A", () => {
  it("exposes marker", () => {
    expect(AI_GOVERNANCE_VALIDATOR_MARKER).toBe("PHASE10A_AI_GOVERNANCE_VALIDATOR");
  });

  it("validates default matrix", () => {
    const result = validateAiGovernanceControlMatrix(
      resolveDefaultAiGovernanceControlMatrix(),
    );
    expect(result.passed).toBe(true);
  });

  it("rejects clientVisibleMinCaseStatus before interview done", () => {
    const matrix = resolveDefaultAiGovernanceControlMatrix();
    matrix.clientVisibleMinCaseStatus = "IN_INTERVIEW";
    const result = validateAiGovernanceControlMatrix(matrix);
    expect(result.passed).toBe(false);
  });
});
