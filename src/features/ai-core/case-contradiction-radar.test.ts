import { describe, expect, it } from "vitest";

import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import {
  CONTRADICTION_RADAR_AXES,
  CONTRADICTION_RADAR_VERSION,
  PHASE9E_CONTRADICTION_RADAR_MARKER,
  scanCaseContradictionRadar,
} from "./case-contradiction-radar";

describe("case-contradiction-radar Phase 9-E", () => {
  it("exposes marker, version, and five axes", () => {
    expect(PHASE9E_CONTRADICTION_RADAR_MARKER).toBe("PHASE9E_CONTRADICTION_RADAR");
    expect(CONTRADICTION_RADAR_VERSION).toBe("9-E.1");
    expect(CONTRADICTION_RADAR_AXES).toHaveLength(5);
  });

  it("detects missing attachment when evidence_summary exists", () => {
    const claim = buildWageBackpayExampleClaim();
    const radar = scanCaseContradictionRadar({
      caseId: "c1",
      scannedAt: new Date().toISOString(),
      interviewAnswers: { evidence_summary: "계약서 첨부 예정" },
      attachments: [],
      claims: [claim],
    });

    expect(
      radar.signals.some((s) => s.signalType === "MISSING_EVIDENCE"),
    ).toBe(true);
  });

  it("detects contradicting claims on wage topic", () => {
    const paid = {
      ...buildWageBackpayExampleClaim(),
      claimId: "claim-paid",
      text: "근로자는 임금을 지급받았다고 진술합니다.",
    };
    const unpaid = {
      ...buildWageBackpayExampleClaim(),
      claimId: "claim-unpaid",
      text: "근로자는 임금을 지급받지 못했다고 주장합니다.",
    };

    const radar = scanCaseContradictionRadar({
      caseId: "c1",
      scannedAt: new Date().toISOString(),
      interviewAnswers: {},
      claims: [paid, unpaid],
    });

    expect(radar.contradictions.length).toBeGreaterThan(0);
    expect(
      radar.signals.some((s) => s.signalType === "CONTRADICTING_CLAIMS"),
    ).toBe(true);
  });
});
