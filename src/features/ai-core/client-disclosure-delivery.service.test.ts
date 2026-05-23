import { describe, expect, it } from "vitest";

import { CONTRADICTION_RADAR_VERSION } from "./case-contradiction-radar";
import { CASE_INTELLIGENCE_GRAPH_VERSION } from "./case-intelligence-graph.schema";
import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import {
  applyLawyerJudgmentDecision,
  buildLawyerJudgmentBoundaryLedgerDraft,
} from "./lawyer-judgment-boundary-ledger.service";
import { computeClientDisclosurePreviewDiff } from "./client-disclosure-preview.service";
import { CLIENT_DISCLOSURE_PREVIEW_VERSION } from "./client-disclosure-preview.schema";
import {
  assertClientDeliveryUsesReleasedStatementsOnly,
  buildClientDisclosureDeliveryPayloadFromRelease,
  mapClientDisclosureDeliveryToSummaryShape,
  PHASE11C_CLIENT_DISCLOSURE_DELIVERY_SERVICE_MARKER,
} from "./client-disclosure-delivery.service";
import { CLIENT_DISCLOSURE_DELIVERY_VERSION } from "./client-disclosure-delivery.schema";
import { projectClientSafeStatements } from "./client-safe-disclosure.service";

describe("client-disclosure-delivery Phase 11-C", () => {
  it("exports service marker", () => {
    expect(PHASE11C_CLIENT_DISCLOSURE_DELIVERY_SERVICE_MARKER).toBe(
      "PHASE11C_CLIENT_DISCLOSURE_DELIVERY_SERVICE",
    );
  });

  it("builds delivery payload from release statements only", () => {
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

    const statements = projectClientSafeStatements({
      ledger,
      caseStatus: "REVIEW_PENDING",
    });

    const release = {
      releaseId: "rel-1",
      caseId: "c1",
      caseStatus: "REVIEW_PENDING" as const,
      previewVersion: CLIENT_DISCLOSURE_PREVIEW_VERSION,
      disclosureVersion: "10-C.1" as const,
      statements,
      diff: computeClientDisclosurePreviewDiff(statements, null),
      releasedByUserId: "lawyer-1",
      releasedAt: createdAt,
    };

    const payload = buildClientDisclosureDeliveryPayloadFromRelease({
      release,
      caseStatus: "REVIEW_PENDING",
    });

    expect(
      assertClientDeliveryUsesReleasedStatementsOnly({ statements, delivery: payload }),
    ).toBe(true);

    const summaryShape = mapClientDisclosureDeliveryToSummaryShape({
      deliveryVersion: CLIENT_DISCLOSURE_DELIVERY_VERSION,
      caseId: "c1",
      caseStatus: "REVIEW_PENDING",
      hasReleasedContent: true,
      release: {
        releaseId: "rel-1",
        releasedAt: createdAt,
        previewVersion: CLIENT_DISCLOSURE_PREVIEW_VERSION,
        disclosureVersion: "10-C.1",
        statementCount: 1,
      },
      delivery: payload,
      emptyNotice: "",
    });

    expect(summaryShape.intelligenceGraph).toBeUndefined();
    expect(summaryShape.clientDisclosureDelivery.deliveryVersion).toBe("11-C.1");
    expect(summaryShape.content.caseOverview).toBeTruthy();
  });

  it("maps empty delivery without intelligenceGraph", () => {
    const mapped = mapClientDisclosureDeliveryToSummaryShape({
      deliveryVersion: CLIENT_DISCLOSURE_DELIVERY_VERSION,
      caseId: "c1",
      caseStatus: "REVIEW_PENDING",
      hasReleasedContent: false,
      release: null,
      delivery: null,
      emptyNotice: "empty",
    });
    expect(mapped.intelligenceGraph).toBeUndefined();
    expect(mapped.content.structuredSummaryNote).toBe("empty");
  });
});
