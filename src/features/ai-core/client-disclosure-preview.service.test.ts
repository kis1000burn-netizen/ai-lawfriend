import { describe, expect, it } from "vitest";

import { CONTRADICTION_RADAR_VERSION } from "./case-contradiction-radar";
import { CASE_INTELLIGENCE_GRAPH_VERSION } from "./case-intelligence-graph.schema";
import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import {
  applyLawyerJudgmentDecision,
  buildLawyerJudgmentBoundaryLedgerDraft,
} from "./lawyer-judgment-boundary-ledger.service";
import {
  buildPreviewFromLedger,
  computeClientDisclosurePreviewDiff,
  PHASE11B_CLIENT_DISCLOSURE_PREVIEW_SERVICE_MARKER,
} from "./client-disclosure-preview.service";

describe("client-disclosure-preview Phase 11-B", () => {
  it("exports service marker", () => {
    expect(PHASE11B_CLIENT_DISCLOSURE_PREVIEW_SERVICE_MARKER).toBe(
      "PHASE11B_CLIENT_DISCLOSURE_PREVIEW_SERVICE",
    );
  });

  it("computes diff for newly released statements", () => {
    const createdAt = new Date().toISOString();
    const claim = buildWageBackpayExampleClaim();
    let ledger = buildLawyerJudgmentBoundaryLedgerDraft({
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
    const target = ledger.entries.find((e) => e.subjectKind === "CLAIM");
    ledger = applyLawyerJudgmentDecision(ledger, {
      entryId: target!.entryId,
      judgmentState: "CONFIRMED",
      lawyerId: "lawyer-1",
      judgedAt: createdAt,
      clientVisible: true,
    });

    const preview = buildPreviewFromLedger({
      caseId: "c1",
      caseStatus: "REVIEW_PENDING",
      generatedAt: createdAt,
      ledger,
    });

    expect(preview.clientPreview.statements).toHaveLength(1);
    expect(preview.diff.hasUnreleasedChanges).toBe(true);
    expect(preview.diff.added).toHaveLength(1);

    const secondPass = computeClientDisclosurePreviewDiff(
      preview.clientPreview.statements,
      preview.clientPreview.statements,
    );
    expect(secondPass.hasUnreleasedChanges).toBe(false);
  });
});
