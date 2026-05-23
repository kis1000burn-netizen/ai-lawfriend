import { describe, expect, it, vi, beforeEach } from "vitest";

const listAttachments = vi.hoisted(() => vi.fn());

vi.mock("@/features/case-attachments/case-attachment.service", () => ({
  listCaseAttachmentsService: listAttachments,
}));

import {
  buildCaseIntelligenceGraphRuntime,
  PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME_MARKER,
} from "./case-intelligence-graph-runtime.service";

describe("case-intelligence-graph-runtime Phase 9-E", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAttachments.mockResolvedValue([]);
  });

  it("exposes marker", () => {
    expect(PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME_MARKER).toBe(
      "PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME",
    );
  });

  it("builds graph and radar from interview + summary content", async () => {
    const result = await buildCaseIntelligenceGraphRuntime({
      currentUser: {
        id: "u1",
        email: "a@b.com",
        name: "User",
        role: "USER",
        status: "ACTIVE",
      },
      caseId: "c1",
      generatedAt: "2026-05-23T12:00:00.000Z",
      caseSummaryAiMode: "RULE_BASED",
      summaryOperation: "CASE_SUMMARY_GENERATE",
      answers: { case_background: "2025년 3월 임금 미지급", evidence_summary: "계약서" },
      validatedContent: {
        caseOverview: "임금 체불 사건",
        timeline: ["2025년 3월부터 미지급"],
        issues: ["임금 체불"],
        riskNotes: [],
        checklist: [],
      },
      gongbuhoResolution: {
        via: "trace",
        code: "WAGE_BACKPAY",
        version: "1.0.0",
      },
    });

    expect(result.graph.graphVersion).toBe("9-D.1");
    expect(result.graph.claims.length).toBeGreaterThan(1);
    expect(result.radar.radarVersion).toBe("9-E.1");
    expect(result.ledger.ledgerVersion).toBe("9-F.1");
    expect(result.ledgerValidationPassed).toBe(true);
    expect(
      result.radar.signals.some((s) => s.signalType === "MISSING_EVIDENCE"),
    ).toBe(true);
  });
});
