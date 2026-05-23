import { describe, expect, it } from "vitest";

import { CONTRADICTION_RADAR_VERSION } from "./case-contradiction-radar";
import { CASE_INTELLIGENCE_GRAPH_VERSION } from "./case-intelligence-graph.schema";
import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import {
  applyLawyerJudgmentDecision,
  buildLawyerJudgmentBoundaryLedgerDraft,
  PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SERVICE_MARKER,
  projectClientVisibleEntries,
} from "./lawyer-judgment-boundary-ledger.service";

describe("lawyer-judgment-boundary-ledger.service Phase 9-F", () => {
  it("exposes marker", () => {
    expect(PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SERVICE_MARKER).toBe(
      "PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SERVICE",
    );
  });

  it("builds draft ledger from graph and radar", () => {
    const createdAt = new Date().toISOString();
    const claim = buildWageBackpayExampleClaim();
    const draft = buildLawyerJudgmentBoundaryLedgerDraft({
      caseId: "c1",
      createdAt,
      graph: {
        graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
        caseId: "c1",
        generatedAt: createdAt,
        summaryOperation: "CASE_SUMMARY_GENERATE",
        caseSummaryAiMode: "RULE_BASED",
        claims: [claim],
      },
      radar: {
        radarVersion: CONTRADICTION_RADAR_VERSION,
        scannedAt: createdAt,
        signalCount: 1,
        signals: [
          {
            signalId: "sig-1",
            signalType: "UNREVIEWED_CRITICAL_ISSUE",
            severity: "MEDIUM",
            axes: ["SUMMARY_CLAIM"],
            claimIds: [claim.claimId],
            message: "검토되지 않은 핵심 Claim",
            requiresLawyerReview: true,
          },
        ],
        contradictions: [],
      },
    });

    expect(draft.motto).toBe("AI는 구조화했고, 변호사가 판단했다");
    expect(draft.summary.aiDetectedCount).toBeGreaterThan(0);
    expect(draft.summary.pendingCount).toBe(draft.entries.length);
  });

  it("applies lawyer confirmation with boundary lanes", () => {
    const createdAt = new Date().toISOString();
    const claim = buildWageBackpayExampleClaim();
    const draft = buildLawyerJudgmentBoundaryLedgerDraft({
      caseId: "c1",
      createdAt,
      graph: {
        graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
        caseId: "c1",
        generatedAt: createdAt,
        summaryOperation: "CASE_SUMMARY_GENERATE",
        caseSummaryAiMode: "RULE_BASED",
        claims: [claim],
      },
      radar: {
        radarVersion: CONTRADICTION_RADAR_VERSION,
        scannedAt: createdAt,
        signalCount: 0,
        signals: [],
        contradictions: [],
      },
    });

    const target = draft.entries.find((e) => e.subjectKind === "CLAIM");
    expect(target).toBeDefined();

    const updated = applyLawyerJudgmentDecision(draft, {
      entryId: target!.entryId,
      judgmentState: "CONFIRMED",
      lawyerId: "lawyer-1",
      judgedAt: createdAt,
      clientVisible: true,
      submissionReady: false,
    });

    const confirmed = updated.entries.find((e) => e.entryId === target!.entryId);
    expect(confirmed?.boundaryLanes).toContain("LAWYER_CONFIRMED");
    expect(confirmed?.boundaryLanes).toContain("CLIENT_VISIBLE");
    expect(projectClientVisibleEntries(updated)).toHaveLength(1);
  });
});
