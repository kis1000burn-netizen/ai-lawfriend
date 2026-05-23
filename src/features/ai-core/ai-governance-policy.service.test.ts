import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import {
  applyLawyerJudgmentDecision,
  buildLawyerJudgmentBoundaryLedgerDraft,
} from "./lawyer-judgment-boundary-ledger.service";
import { CONTRADICTION_RADAR_VERSION } from "./case-contradiction-radar";
import { CASE_INTELLIGENCE_GRAPH_VERSION } from "./case-intelligence-graph.schema";
import {
  assertCaseSummaryAiGovernanceAllowsInvoke,
  canReleaseLedgerEntryToClient,
  evaluateAiGovernanceGate,
  filterIntelligenceGraphForRole,
  PHASE10A_AI_GOVERNANCE_POLICY_SERVICE_MARKER,
  resolveDefaultAiGovernanceControlMatrix,
} from "./ai-governance-policy.service";

describe("ai-governance-policy.service Phase 10-A", () => {
  const envSnapshot = { ...process.env };

  beforeEach(() => {
    delete process.env.AI_GOVERNANCE_AI_ENABLED;
  });

  afterEach(() => {
    if (envSnapshot.AI_GOVERNANCE_AI_ENABLED === undefined) {
      delete process.env.AI_GOVERNANCE_AI_ENABLED;
    } else {
      process.env.AI_GOVERNANCE_AI_ENABLED = envSnapshot.AI_GOVERNANCE_AI_ENABLED;
    }
  });

  it("exposes marker", () => {
    expect(PHASE10A_AI_GOVERNANCE_POLICY_SERVICE_MARKER).toBe(
      "PHASE10A_AI_GOVERNANCE_POLICY_SERVICE",
    );
  });

  it("allows CLIENT to invoke case summary in active case", () => {
    const result = assertCaseSummaryAiGovernanceAllowsInvoke({
      currentUser: {
        id: "u1",
        email: "c@x.com",
        name: "Client",
        role: "USER",
        status: "ACTIVE",
      },
      caseStatus: "IN_INTERVIEW",
    });
    expect(result.allowed).toBe(true);
  });

  it("blocks AI when tenant master switch is off", () => {
    process.env.AI_GOVERNANCE_AI_ENABLED = "false";
    const matrix = resolveDefaultAiGovernanceControlMatrix();
    const result = evaluateAiGovernanceGate({
      action: "AI_INVOKE",
      feature: "CASE_SUMMARY",
      actorRole: "LAWYER",
      caseStatus: "IN_INTERVIEW",
      matrix,
    });
    expect(result.allowed).toBe(false);
    expect(result.controlCode).toBe("TENANT_AI_DISABLED");
  });

  it("blocks CLIENT from viewing intelligence graph", () => {
    const filtered = filterIntelligenceGraphForRole({
      actorRole: "CLIENT",
      intelligenceGraph: {
        graph: {
          graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
          caseId: "c1",
          generatedAt: new Date().toISOString(),
          summaryOperation: "CASE_SUMMARY_GENERATE",
          caseSummaryAiMode: "RULE_BASED",
          claims: [buildWageBackpayExampleClaim()],
        },
        radar: {
          radarVersion: CONTRADICTION_RADAR_VERSION,
          scannedAt: new Date().toISOString(),
          signalCount: 0,
          signals: [],
          contradictions: [],
        },
        radarValidationPassed: true,
        radarValidationIssues: [],
        ledger: buildLawyerJudgmentBoundaryLedgerDraft({
          caseId: "c1",
          createdAt: new Date().toISOString(),
          graph: {
            graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
            caseId: "c1",
            generatedAt: new Date().toISOString(),
            summaryOperation: "CASE_SUMMARY_GENERATE",
            caseSummaryAiMode: "RULE_BASED",
            claims: [],
          },
          radar: {
            radarVersion: CONTRADICTION_RADAR_VERSION,
            scannedAt: new Date().toISOString(),
            signalCount: 0,
            signals: [],
            contradictions: [],
          },
        }),
        ledgerValidationPassed: true,
        ledgerValidationIssues: [],
      },
    });
    expect(filtered).toBeUndefined();
  });

  it("blocks client release before REVIEW_PENDING", () => {
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
    ledger = applyLawyerJudgmentDecision(ledger, {
      entryId: ledger.entries[0]!.entryId,
      judgmentState: "CONFIRMED",
      lawyerId: "lawyer-1",
      judgedAt: createdAt,
      clientVisible: true,
    });

    const release = canReleaseLedgerEntryToClient({
      entry: ledger.entries[0]!,
      caseStatus: "IN_INTERVIEW",
      actorRole: "LAWYER",
    });
    expect(release.allowed).toBe(false);
    expect(release.controlCode).toBe("CASE_STATUS_TOO_EARLY");
  });
});
