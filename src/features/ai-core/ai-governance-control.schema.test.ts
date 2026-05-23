import { describe, expect, it } from "vitest";

import {
  AI_GOVERNANCE_CONTROL_MATRIX_VERSION,
  AI_GOVERNANCE_FEATURES,
  PHASE10A_AI_GOVERNANCE_CONTROL_MARKER,
  parseAiGovernanceControlMatrix,
} from "./ai-governance-control.schema";
import { resolveDefaultAiGovernanceControlMatrix } from "./ai-governance-policy.service";
import { validateAiGovernanceControlMatrix } from "./ai-governance-validator";

describe("ai-governance-control.schema Phase 10-A", () => {
  it("exposes marker, version, and features", () => {
    expect(PHASE10A_AI_GOVERNANCE_CONTROL_MARKER).toBe(
      "PHASE10A_AI_GOVERNANCE_CONTROL",
    );
    expect(AI_GOVERNANCE_CONTROL_MATRIX_VERSION).toBe("10-A.1");
    expect(AI_GOVERNANCE_FEATURES.length).toBe(5);
  });

  it("parses default matrix", () => {
    const matrix = resolveDefaultAiGovernanceControlMatrix();
    expect(parseAiGovernanceControlMatrix(matrix).matrixVersion).toBe("10-A.1");
    expect(validateAiGovernanceControlMatrix(matrix).passed).toBe(true);
  });
});
