import { describe, expect, it } from "vitest";

import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import {
  assertClaimNoFinalJudgment,
  CASE_SUMMARY_CLAIM_VALIDATOR_MARKER,
  validateCaseIntelligenceClaim,
} from "./case-summary-claim-validator";

describe("case-summary-claim-validator Phase 9-D", () => {
  it("exposes marker", () => {
    expect(CASE_SUMMARY_CLAIM_VALIDATOR_MARKER).toBe(
      "PHASE9D_CASE_SUMMARY_CLAIM_VALIDATOR",
    );
  });

  it("blocks final judgment language", () => {
    const claim = {
      ...buildWageBackpayExampleClaim(),
      text: "반드시 승소합니다.",
    };
    const issues = assertClaimNoFinalJudgment(claim);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("passes valid wage example", () => {
    const result = validateCaseIntelligenceClaim(buildWageBackpayExampleClaim());
    expect(result.passed).toBe(true);
  });
});
