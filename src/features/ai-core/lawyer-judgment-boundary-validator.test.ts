import { describe, expect, it } from "vitest";

import { CONTRADICTION_RADAR_VERSION } from "./case-contradiction-radar";
import { CASE_INTELLIGENCE_GRAPH_VERSION } from "./case-intelligence-graph.schema";
import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import {
  buildLawyerJudgmentBoundaryLedgerDraft,
  applyLawyerJudgmentDecision,
} from "./lawyer-judgment-boundary-ledger.service";
import {
  LAWYER_JUDGMENT_BOUNDARY_VALIDATOR_MARKER,
  validateLawyerJudgmentBoundaryLedger,
} from "./lawyer-judgment-boundary-validator";

describe("lawyer-judgment-boundary-validator Phase 9-F", () => {
  it("exposes marker", () => {
    expect(LAWYER_JUDGMENT_BOUNDARY_VALIDATOR_MARKER).toBe(
      "PHASE9F_LAWYER_JUDGMENT_BOUNDARY_VALIDATOR",
    );
  });

  it("passes pending draft ledger", () => {
    const createdAt = new Date().toISOString();
    const draft = buildLawyerJudgmentBoundaryLedgerDraft({
      caseId: "c1",
      createdAt,
      graph: {
        graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
        caseId: "c1",
        generatedAt: createdAt,
        summaryOperation: "CASE_SUMMARY_GENERATE",
        caseSummaryAiMode: "RULE_BASED",
        claims: [buildWageBackpayExampleClaim()],
      },
      radar: {
        radarVersion: CONTRADICTION_RADAR_VERSION,
        scannedAt: createdAt,
        signalCount: 0,
        signals: [],
        contradictions: [],
      },
    });

    const result = validateLawyerJudgmentBoundaryLedger(draft, {
      strictRejectionReason: false,
    });
    expect(result.passed).toBe(true);
  });

  it("rejects clientVisible on pending entry", () => {
    const createdAt = new Date().toISOString();
    const draft = buildLawyerJudgmentBoundaryLedgerDraft({
      caseId: "c1",
      createdAt,
      graph: {
        graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
        caseId: "c1",
        generatedAt: createdAt,
        summaryOperation: "CASE_SUMMARY_GENERATE",
        caseSummaryAiMode: "RULE_BASED",
        claims: [buildWageBackpayExampleClaim()],
      },
      radar: {
        radarVersion: CONTRADICTION_RADAR_VERSION,
        scannedAt: createdAt,
        signalCount: 0,
        signals: [],
        contradictions: [],
      },
    });

    draft.entries[0]!.clientVisible = true;
    const result = validateLawyerJudgmentBoundaryLedger(draft, {
      strictRejectionReason: false,
    });
    expect(result.passed).toBe(false);
  });

  it("rejects rejected entry marked clientVisible", () => {
    const createdAt = new Date().toISOString();
    let draft = buildLawyerJudgmentBoundaryLedgerDraft({
      caseId: "c1",
      createdAt,
      graph: {
        graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
        caseId: "c1",
        generatedAt: createdAt,
        summaryOperation: "CASE_SUMMARY_GENERATE",
        caseSummaryAiMode: "RULE_BASED",
        claims: [buildWageBackpayExampleClaim()],
      },
      radar: {
        radarVersion: CONTRADICTION_RADAR_VERSION,
        scannedAt: createdAt,
        signalCount: 0,
        signals: [],
        contradictions: [],
      },
    });

    draft = applyLawyerJudgmentDecision(draft, {
      entryId: draft.entries[0]!.entryId,
      judgmentState: "REJECTED",
      lawyerId: "lawyer-1",
      judgedAt: createdAt,
      rejectionReason: "근거 불충분",
      clientVisible: true,
    });

    const result = validateLawyerJudgmentBoundaryLedger(draft);
    expect(result.passed).toBe(false);
  });
});
