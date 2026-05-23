import { describe, expect, it } from "vitest";

import { CONTRADICTION_RADAR_VERSION } from "./case-contradiction-radar";
import { CASE_INTELLIGENCE_GRAPH_VERSION } from "./case-intelligence-graph.schema";
import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import { buildLawyerJudgmentBoundaryLedgerDraft } from "./lawyer-judgment-boundary-ledger.service";
import { buildClientSafeDisclosureLayer } from "./client-safe-disclosure.service";
import {
  CLIENT_SAFE_DISCLOSURE_VALIDATOR_MARKER,
  validateClientSafeDisclosureLayer,
} from "./client-safe-disclosure-validator";

describe("client-safe-disclosure.validator Phase 10-C", () => {
  it("exposes marker", () => {
    expect(CLIENT_SAFE_DISCLOSURE_VALIDATOR_MARKER).toBe(
      "PHASE10C_CLIENT_SAFE_DISCLOSURE_VALIDATOR",
    );
  });

  it("validates empty disclosure layer", () => {
    const createdAt = new Date().toISOString();
    const layer = buildClientSafeDisclosureLayer({
      caseId: "c1",
      caseStatus: "IN_INTERVIEW",
      generatedAt: createdAt,
      ledger: buildLawyerJudgmentBoundaryLedgerDraft({
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
      }),
    });
    expect(validateClientSafeDisclosureLayer(layer).passed).toBe(true);
  });
});
