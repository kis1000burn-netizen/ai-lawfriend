import { describe, expect, it } from "vitest";

import {
  LAWYER_JUDGMENT_BOUNDARY_LEDGER_VERSION,
  LAWYER_JUDGMENT_BOUNDARY_MOTTO,
  parseLawyerJudgmentBoundaryLedger,
  PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_MARKER,
} from "./lawyer-judgment-boundary-ledger.schema";

describe("lawyer-judgment-boundary-ledger.schema Phase 9-F", () => {
  it("exposes marker, version, and motto", () => {
    expect(PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_MARKER).toBe(
      "PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER",
    );
    expect(LAWYER_JUDGMENT_BOUNDARY_LEDGER_VERSION).toBe("9-F.1");
    expect(LAWYER_JUDGMENT_BOUNDARY_MOTTO).toBe("AI는 구조화했고, 변호사가 판단했다");
  });

  it("parses minimal ledger", () => {
    const ledger = parseLawyerJudgmentBoundaryLedger({
      ledgerVersion: "9-F.1",
      caseId: "c1",
      createdAt: new Date().toISOString(),
      graphVersion: "9-D.1",
      radarVersion: "9-E.1",
      motto: "AI는 구조화했고, 변호사가 판단했다",
      entries: [
        {
          entryId: "e1",
          subjectKind: "CLAIM",
          subjectId: "claim-1",
          aiDetectedText: "테스트 Claim",
          aiDetectedAt: new Date().toISOString(),
          judgmentState: "PENDING",
          clientVisible: false,
          submissionReady: false,
          boundaryLanes: ["AI_DETECTED"],
        },
      ],
      summary: {
        aiDetectedCount: 1,
        pendingCount: 1,
        confirmedCount: 0,
        rejectedCount: 0,
        editedCount: 0,
        clientVisibleCount: 0,
        submissionReadyCount: 0,
      },
    });
    expect(ledger.entries).toHaveLength(1);
  });
});
