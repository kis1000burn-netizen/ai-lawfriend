import { describe, expect, it } from "vitest";

import {
  CASE_CONTRADICTION_VALIDATOR_MARKER,
  validateCaseContradictionRadarResult,
} from "./case-contradiction-validator";
import { scanCaseContradictionRadar } from "./case-contradiction-radar";
import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";

describe("case-contradiction-validator Phase 9-E", () => {
  it("exposes marker", () => {
    expect(CASE_CONTRADICTION_VALIDATOR_MARKER).toBe(
      "PHASE9E_CASE_CONTRADICTION_VALIDATOR",
    );
  });

  it("validates radar scan output", () => {
    const radar = scanCaseContradictionRadar({
      caseId: "c1",
      scannedAt: new Date().toISOString(),
      interviewAnswers: {},
      claims: [buildWageBackpayExampleClaim()],
    });
    const result = validateCaseContradictionRadarResult(radar);
    expect(result.passed).toBe(true);
  });

  it("rejects signal with final judgment language", () => {
    const radar = scanCaseContradictionRadar({
      caseId: "c1",
      scannedAt: new Date().toISOString(),
      interviewAnswers: {},
      claims: [buildWageBackpayExampleClaim()],
    });
    radar.signals.push({
      signalId: "bad-signal",
      signalType: "RISKY_ASSERTION",
      severity: "HIGH",
      axes: ["SUMMARY_CLAIM"],
      message: "반드시 승소합니다.",
      requiresLawyerReview: true,
    });
    radar.signalCount = radar.signals.length;

    const result = validateCaseContradictionRadarResult(radar);
    expect(result.passed).toBe(false);
  });
});
