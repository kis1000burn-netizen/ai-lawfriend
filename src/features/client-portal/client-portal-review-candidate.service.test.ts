import { describe, expect, it } from "vitest";
import {
  buildPortalCollaborationReviewItems,
  buildPortalReviewItemsFromStoredDecisions,
  clientEvidenceItemIdFromMessageAttachment,
  clientStatementItemIdFromMessage,
  clientStatementItemIdFromSubmission,
  PHASE15C2_CLIENT_STATEMENT_REVIEW_GATE_MARKER,
} from "./client-portal-review-candidate.service";
import { buildDocumentIntelligenceReviewQueue } from "@/features/document-intelligence/document-intelligence-review-queue.builder";

describe("client-portal-review-candidate.service (Phase 15-C.2)", () => {
  it("exposes phase marker", () => {
    expect(PHASE15C2_CLIENT_STATEMENT_REVIEW_GATE_MARKER).toBe(
      "PHASE15C2_CLIENT_STATEMENT_REVIEW_GATE",
    );
  });

  it("builds CLIENT_STATEMENT queue items from adopted chat", () => {
    const messageId = "clxxxxxxxxxxxxxxxxxxxxxxxxx";
    const items = buildPortalCollaborationReviewItems(
      {
        messages: [
          {
            id: messageId,
            body: "2024년 3월에 계약금을 송금했습니다.",
            sender: { name: "홍길동", role: "USER" },
            attachments: [
              { uploadedFileId: "clxxxxxxxxxxxxxxxxxxxxxxxxy", originalFileName: "송금확인.pdf" },
            ],
          },
        ],
        submissions: [],
      },
      new Map(),
    );

    expect(items).toHaveLength(2);
    expect(items[0]?.itemId).toBe(clientStatementItemIdFromMessage(messageId));
    expect(items[0]?.itemCategory).toBe("client_statement");
    expect(items[0]?.sourcePhase).toBe("PHASE_15C");
    expect(items[0]?.downstreamUsable).toBe(false);
    expect(items[1]?.itemId).toBe(
      clientEvidenceItemIdFromMessageAttachment(messageId, "clxxxxxxxxxxxxxxxxxxxxxxxxy"),
    );
    expect(items[1]?.itemCategory).toBe("evidence");
  });

  it("builds portal items from accepted client submission", () => {
    const submissionId = "clxxxxxxxxxxxxxxxxxxxxxxxz";
    const items = buildPortalCollaborationReviewItems(
      {
        messages: [],
        submissions: [
          {
            id: submissionId,
            kind: "FREE_UPLOAD",
            message: "임대차 계약서 원본입니다.",
            submitter: { name: "김의뢰" },
            files: [
              {
                description: "계약서 스캔본",
                uploadedFile: { id: "clxxxxxxxxxxxxxxxxxxxxxaa", originalFileName: "contract.pdf" },
              },
            ],
          },
        ],
      },
      new Map(),
    );

    expect(items[0]?.itemId).toBe(clientStatementItemIdFromSubmission(submissionId));
    expect(items[0]?.sourcePhase).toBe("PHASE_15B");
    expect(items[1]?.displayText).toContain("계약서 스캔본");
  });

  it("builds queue items from stored portal review decisions", () => {
    const items = buildPortalReviewItemsFromStoredDecisions([
      {
        id: "dec1",
        caseId: "clxxxxxxxxxxxxxxxxxxxxxxxb",
        itemId: "15c-msg-clxxxxxxxxxxxxxxxxxxxxxxxxx",
        sourcePhase: "PHASE_15C",
        sourceFileId: null,
        itemCategory: "client_statement",
        aiText: "의뢰인 진술",
        reviewStatus: "NEEDS_LAWYER_REVIEW",
        editedText: null,
        rejectionReason: null,
        reviewNote: null,
        ledgerEntryJson: null,
        payloadJson: { source: "CHAT_MESSAGE" },
        reviewedByUserId: null,
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as never);

    expect(items).toHaveLength(1);
    expect(items[0]?.downstreamUsable).toBe(false);
    expect(items[0]?.itemCategory).toBe("client_statement");
  });

  it("merges portal items into document intelligence review queue", () => {
    const messageId = "clxxxxxxxxxxxxxxxxxxxxxxxxx";
    const queue = buildDocumentIntelligenceReviewQueue({
      caseId: "clxxxxxxxxxxxxxxxxxxxxxxxb",
      litigationFiles: [],
      evidenceMapping: null,
      decisions: [],
      portalSources: {
        messages: [
          {
            id: messageId,
            body: "추가 설명 드립니다.",
            sender: { name: "의뢰인", role: "USER" },
            attachments: [],
          },
        ],
        submissions: [],
      },
    });

    expect(queue.summary.phase15cCount).toBe(1);
    expect(queue.summary.pendingCount).toBe(1);
    expect(queue.items[0]?.itemCategory).toBe("client_statement");
  });
});
