import { describe, expect, it } from "vitest";

import { CONTRADICTION_RADAR_VERSION } from "./case-contradiction-radar";
import { CASE_INTELLIGENCE_GRAPH_VERSION } from "./case-intelligence-graph.schema";
import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import {
  applyLawyerJudgmentDecision,
  buildLawyerJudgmentBoundaryLedgerDraft,
} from "./lawyer-judgment-boundary-ledger.service";
import {
  extractSavedDecisions,
  mergeSavedDecisionsIntoLedger,
  PHASE11A_LAWYER_REVIEW_CONSOLE_SERVICE_MARKER,
} from "./case-intelligence-review.service";

describe("case-intelligence-review Phase 11-A", () => {
  it("exports service marker", () => {
    expect(PHASE11A_LAWYER_REVIEW_CONSOLE_SERVICE_MARKER).toBe(
      "PHASE11A_LAWYER_REVIEW_CONSOLE_SERVICE",
    );
  });

  it("merges saved decisions by subjectKind+subjectId after refresh", () => {
    const generatedAt = new Date().toISOString();
    const claim = buildWageBackpayExampleClaim();
    const graph = {
      graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
      caseId: "case-1",
      generatedAt,
      summaryOperation: "CASE_SUMMARY_GENERATE" as const,
      caseSummaryAiMode: "RULE_BASED" as const,
      claims: [claim],
    };
    const radar = {
      radarVersion: CONTRADICTION_RADAR_VERSION,
      scannedAt: generatedAt,
      signalCount: 0,
      signals: [],
      contradictions: [],
    };
    const ledger = buildLawyerJudgmentBoundaryLedgerDraft({
      caseId: "case-1",
      createdAt: generatedAt,
      graph,
      radar,
    });
    const target = ledger.entries.find((e) => e.subjectKind === "CLAIM");
    expect(target).toBeDefined();

    const decided = applyLawyerJudgmentDecision(ledger, {
      entryId: target!.entryId,
      judgmentState: "CONFIRMED",
      lawyerId: "lawyer-1",
      judgedAt: generatedAt,
      clientVisible: true,
    });
    const saved = extractSavedDecisions(decided);
    const fresh = buildLawyerJudgmentBoundaryLedgerDraft({
      caseId: "case-1",
      createdAt: generatedAt,
      graph,
      radar,
    });
    const merged = mergeSavedDecisionsIntoLedger(fresh, saved);
    const remapped = merged.entries.find(
      (e) => e.subjectKind === target!.subjectKind && e.subjectId === target!.subjectId,
    );
    expect(remapped?.judgmentState).toBe("CONFIRMED");
    expect(remapped?.clientVisible).toBe(true);
  });
});
