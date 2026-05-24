import { describe, expect, it } from "vitest";
import { analyzeLitigationDocumentContent } from "./document-analysis.engine";
import { buildDocumentIntelligenceReviewQueue } from "./document-intelligence-review-queue.builder";
import { buildLedgerEntryFromReviewItem } from "./document-intelligence-review-ledger";
import { isConfirmedReviewStatus } from "./document-intelligence-review.schema";

describe("document-intelligence-review-queue.builder (Phase 13-G)", () => {
  it("aggregates 13-D items into review queue", () => {
    const analysis = analyzeLitigationDocumentContent({
      fileId: "file-1",
      caseId: "case-1",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "답변서.pdf",
      pages: [
        {
          pageNumber: 1,
          text: "피고는 원고의 청구를 다투며 금전 수령 사실은 인정한다.",
          confidence: 0.95,
        },
      ],
    });

    const queue = buildDocumentIntelligenceReviewQueue({
      caseId: "case-1",
      litigationFiles: [
        {
          id: "file-1",
          originalFileName: "답변서.pdf",
          analyses: [{ analysisStatus: "AI_ANALYZED", analysisJson: analysis }],
          opponentBriefAnalyses: [],
        },
      ],
      evidenceMapping: null,
      decisions: [],
    });

    expect(queue.items.length).toBeGreaterThan(0);
    expect(queue.summary.pendingCount).toBe(queue.items.length);
    expect(queue.items[0]?.decisionLabel).toBe("PENDING");
    expect(queue.items[0]?.downstreamUsable).toBe(false);
    expect(queue.summary.phase13dCount).toBeGreaterThan(0);
  });

  it("binds ledger entry on confirmed decision shape", () => {
    const entry = buildLedgerEntryFromReviewItem(
      {
        itemId: "13d-file-1-claim-0",
        sourcePhase: "PHASE_13D",
        itemCategory: "claim",
        aiText: "금전 수령 사실은 인정한다.",
        reviewStatus: "LAWYER_CONFIRMED",
      },
      new Date().toISOString(),
    );

    expect(entry.subjectKind).toBe("DOCUMENT_CLAIM");
    expect(entry.judgmentState).toBe("CONFIRMED");
    expect(entry.clientVisible).toBe(false);
    expect(isConfirmedReviewStatus("LAWYER_CONFIRMED")).toBe(true);
  });
});
