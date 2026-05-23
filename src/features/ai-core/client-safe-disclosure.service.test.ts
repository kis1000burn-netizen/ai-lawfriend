import { describe, expect, it } from "vitest";

import { CONTRADICTION_RADAR_VERSION } from "./case-contradiction-radar";
import { CASE_INTELLIGENCE_GRAPH_VERSION } from "./case-intelligence-graph.schema";
import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import {
  applyLawyerJudgmentDecision,
  buildLawyerJudgmentBoundaryLedgerDraft,
} from "./lawyer-judgment-boundary-ledger.service";
import {
  applyClientSafeDisclosureToSummaryResult,
  buildClientSafeDisclosureLayer,
  projectClientSafeStatements,
  PHASE10C_CLIENT_SAFE_DISCLOSURE_SERVICE_MARKER,
} from "./client-safe-disclosure.service";
import { validateClientSafeDisclosureLayer } from "./client-safe-disclosure-validator";

describe("client-safe-disclosure.service Phase 10-C", () => {
  it("exposes marker", () => {
    expect(PHASE10C_CLIENT_SAFE_DISCLOSURE_SERVICE_MARKER).toBe(
      "PHASE10C_CLIENT_SAFE_DISCLOSURE_SERVICE",
    );
  });

  it("blocks radar and pending ledger from client statements", () => {
    const createdAt = new Date().toISOString();
    const claim = buildWageBackpayExampleClaim();
    const ledger = buildLawyerJudgmentBoundaryLedgerDraft({
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
            message: "검토되지 않은 핵심 Claim",
            requiresLawyerReview: true,
          },
        ],
        contradictions: [],
      },
    });

    const statements = projectClientSafeStatements({
      ledger,
      caseStatus: "REVIEW_PENDING",
    });
    expect(statements).toHaveLength(0);
  });

  it("releases confirmed CLIENT_VISIBLE claim after case status gate", () => {
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

    const layer = buildClientSafeDisclosureLayer({
      caseId: "c1",
      caseStatus: "REVIEW_PENDING",
      generatedAt: createdAt,
      ledger,
    });
    expect(layer.statements.length).toBeGreaterThan(0);
    expect(validateClientSafeDisclosureLayer(layer).passed).toBe(true);
  });

  it("strips intelligenceGraph for CLIENT audience", () => {
    const createdAt = new Date().toISOString();
    const applied = applyClientSafeDisclosureToSummaryResult({
      currentUser: {
        id: "u1",
        email: "c@x.com",
        name: "Client",
        role: "USER",
        status: "ACTIVE",
      },
      caseId: "c1",
      caseStatus: "REVIEW_PENDING",
      result: {
        generatedAt: createdAt,
        outputContractApplied: true,
        gongbuhoResolution: { via: "trace", code: "WAGE" },
        content: {
          caseOverview: "내부 요약",
          timeline: ["내부"],
          issues: [],
          riskNotes: ["위험"],
          checklist: [],
          disclaimer: "d",
        },
        disclaimerApplied: true,
        caseStatus: "REVIEW_PENDING",
        intelligenceGraph: {
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
          radarValidationPassed: true,
          radarValidationIssues: [],
          ledger: buildLawyerJudgmentBoundaryLedgerDraft({
            caseId: "c1",
            createdAt,
            graph: {
              graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
              caseId: "c1",
              generatedAt: createdAt,
              summaryOperation: "CASE_SUMMARY_GENERATE",
              caseSummaryAiMode: "RULE_BASED",
              claims: [],
            },
            radar: {
              radarVersion: CONTRADICTION_RADAR_VERSION,
              scannedAt: createdAt,
              signalCount: 0,
              signals: [],
              contradictions: [],
            },
          }),
          ledgerValidationPassed: true,
          ledgerValidationIssues: [],
        },
      },
    });

    expect(applied.intelligenceGraph).toBeUndefined();
    expect(applied.gongbuhoResolution).toBeUndefined();
    expect(applied.clientSafeDisclosure?.disclosureVersion).toBe("10-C.1");
    expect(applied.content.riskNotes).toEqual([]);
  });
});
