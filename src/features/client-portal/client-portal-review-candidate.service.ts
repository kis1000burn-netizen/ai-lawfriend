/**
 * Phase 15-C.2 — Portal collaboration → 13-G Review Gate (CLIENT_STATEMENT candidates).
 * Chat/submission adoption creates NEEDS_LAWYER_REVIEW items; downstream requires LAWYER_CONFIRMED.
 */
import type { LitigationDocumentIntelligenceReviewDecision } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildLedgerEntryFromReviewItem } from "@/features/document-intelligence/document-intelligence-review-ledger";
import {
  categoryToLedgerSubjectKind,
  isConfirmedReviewStatus,
  toDecisionLabel,
  type DocumentIntelligenceReviewQueueItem,
} from "@/features/document-intelligence/document-intelligence-review.schema";
import {
  findReviewDecisionByCaseAndItemId,
  upsertReviewDecision,
} from "@/features/document-intelligence/document-intelligence-review.repository";

export const PHASE15C2_CLIENT_STATEMENT_REVIEW_GATE_MARKER =
  "PHASE15C2_CLIENT_STATEMENT_REVIEW_GATE" as const;

export function clientStatementItemIdFromMessage(messageId: string): string {
  return `15c-msg-${messageId}`;
}

export function clientEvidenceItemIdFromMessageAttachment(
  messageId: string,
  uploadedFileId: string,
): string {
  return `15c-msg-${messageId}-att-${uploadedFileId}`;
}

export function clientStatementItemIdFromSubmission(submissionId: string): string {
  return `15b-sub-${submissionId}-statement`;
}

export function clientEvidenceItemIdFromSubmissionFile(
  submissionId: string,
  uploadedFileId: string,
): string {
  return `15b-sub-${submissionId}-file-${uploadedFileId}`;
}

export type PortalReviewSources = Awaited<ReturnType<typeof loadPortalReviewSources>>;

function mergeQueueItem(
  partial: Omit<
    DocumentIntelligenceReviewQueueItem,
    "decisionLabel" | "downstreamUsable" | "ledgerSubjectKind"
  >,
  decision?: LitigationDocumentIntelligenceReviewDecision | null,
): DocumentIntelligenceReviewQueueItem {
  const reviewStatus =
    (decision?.reviewStatus as DocumentIntelligenceReviewQueueItem["reviewStatus"]) ??
    partial.reviewStatus;
  return {
    ...partial,
    reviewStatus,
    decisionLabel: toDecisionLabel(reviewStatus),
    editedText: decision?.editedText ?? partial.editedText,
    rejectionReason: decision?.rejectionReason ?? partial.rejectionReason,
    reviewNote: decision?.reviewNote ?? partial.reviewNote,
    reviewedAt: decision?.reviewedAt?.toISOString(),
    reviewedByUserId: decision?.reviewedByUserId ?? undefined,
    ledgerEntryId: decision ? `doc-intel-${partial.itemId}` : partial.ledgerEntryId,
    ledgerSubjectKind: categoryToLedgerSubjectKind(partial.itemCategory),
    displayText: decision?.editedText ?? partial.displayText,
    downstreamUsable: isConfirmedReviewStatus(reviewStatus),
  };
}

export async function loadPortalReviewSources(caseId: string): Promise<{
  messages: Array<{
    id: string;
    body: string;
    sender: { name: string; role: string };
    attachments: Array<{ uploadedFileId: string; originalFileName: string }>;
  }>;
  submissions: Array<{
    id: string;
    kind: string;
    message: string | null;
    submitter: { name: string };
    files: Array<{
      description: string | null;
      uploadedFile: { id: string; originalFileName: string };
    }>;
  }>;
}> {
  const [messages, submissions] = await Promise.all([
    prisma.caseConversationMessage.findMany({
      where: { caseId, isPinnedForRecord: true },
      include: {
        attachments: {
          select: { uploadedFileId: true, originalFileName: true },
        },
        sender: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.clientSubmission.findMany({
      where: { caseId, status: "ACCEPTED" },
      include: {
        submitter: { select: { name: true } },
        files: {
          include: {
            uploadedFile: { select: { id: true, originalFileName: true } },
          },
        },
      },
      orderBy: { acceptedAt: "asc" },
    }),
  ]);

  return { messages, submissions };
}

export function buildPortalCollaborationReviewItems(
  sources: PortalReviewSources,
  decisions: Map<string, LitigationDocumentIntelligenceReviewDecision>,
): DocumentIntelligenceReviewQueueItem[] {
  const items: DocumentIntelligenceReviewQueueItem[] = [];

  for (const message of sources.messages) {
    const bodyItemId = clientStatementItemIdFromMessage(message.id);
    const bodyText = message.body.trim() || "(내용 없음)";
    items.push(
      mergeQueueItem(
        {
          itemId: bodyItemId,
          sourcePhase: "PHASE_15C",
          itemCategory: "client_statement",
          aiText: bodyText,
          displayText: `[채팅·${message.sender.name}] ${bodyText}`,
          reviewStatus: "NEEDS_LAWYER_REVIEW",
          citations: [],
          payload: {
            messageId: message.id,
            senderRole: message.sender.role,
            source: "CHAT_MESSAGE",
          },
        },
        decisions.get(bodyItemId),
      ),
    );

    for (const attachment of message.attachments) {
      const attItemId = clientEvidenceItemIdFromMessageAttachment(
        message.id,
        attachment.uploadedFileId,
      );
      const label = attachment.originalFileName;
      items.push(
        mergeQueueItem(
          {
            itemId: attItemId,
            sourcePhase: "PHASE_15C",
            sourceFileId: attachment.uploadedFileId,
            sourceFileName: label,
            itemCategory: "evidence",
            aiText: label,
            displayText: `[채팅 첨부] ${label}`,
            reviewStatus: "NEEDS_LAWYER_REVIEW",
            citations: [],
            payload: {
              messageId: message.id,
              source: "CHAT_ATTACHMENT",
            },
          },
          decisions.get(attItemId),
        ),
      );
    }
  }

  for (const submission of sources.submissions) {
    if (submission.message?.trim()) {
      const stmtItemId = clientStatementItemIdFromSubmission(submission.id);
      const text = submission.message.trim();
      items.push(
        mergeQueueItem(
          {
            itemId: stmtItemId,
            sourcePhase: "PHASE_15B",
            itemCategory: "client_statement",
            aiText: text,
            displayText: `[의뢰인 제출·${submission.submitter.name}] ${text}`,
            reviewStatus: "NEEDS_LAWYER_REVIEW",
            citations: [],
            payload: {
              submissionId: submission.id,
              submissionKind: submission.kind,
              source: "CLIENT_SUBMISSION_MESSAGE",
            },
          },
          decisions.get(stmtItemId),
        ),
      );
    }

    for (const file of submission.files) {
      const fileItemId = clientEvidenceItemIdFromSubmissionFile(
        submission.id,
        file.uploadedFile.id,
      );
      const description =
        file.description?.trim() ||
        file.uploadedFile.originalFileName;
      items.push(
        mergeQueueItem(
          {
            itemId: fileItemId,
            sourcePhase: "PHASE_15B",
            sourceFileId: file.uploadedFile.id,
            sourceFileName: file.uploadedFile.originalFileName,
            itemCategory: "evidence",
            aiText: description,
            displayText: `[의뢰인 제출 파일] ${description}`,
            reviewStatus: "NEEDS_LAWYER_REVIEW",
            citations: [],
            payload: {
              submissionId: submission.id,
              submissionKind: submission.kind,
              source: "CLIENT_SUBMISSION_FILE",
            },
          },
          decisions.get(fileItemId),
        ),
      );
    }
  }

  return items;
}

async function persistPortalReviewCandidate(input: {
  caseId: string;
  itemId: string;
  sourcePhase: "PHASE_15B" | "PHASE_15C";
  sourceFileId?: string | null;
  itemCategory: "client_statement" | "evidence";
  aiText: string;
  payloadJson?: Record<string, unknown>;
}) {
  const queueShape = {
    itemId: input.itemId,
    sourcePhase: input.sourcePhase,
    itemCategory: input.itemCategory,
    aiText: input.aiText,
    reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
  };

  const existing = await findReviewDecisionByCaseAndItemId(input.caseId, input.itemId);
  if (existing) {
    return existing;
  }

  return upsertReviewDecision({
    caseId: input.caseId,
    itemId: input.itemId,
    sourcePhase: input.sourcePhase,
    sourceFileId: input.sourceFileId ?? null,
    itemCategory: input.itemCategory,
    aiText: input.aiText,
    reviewStatus: "NEEDS_LAWYER_REVIEW",
    payloadJson: input.payloadJson,
    ledgerEntryJson: buildLedgerEntryFromReviewItem(queueShape, new Date().toISOString()),
    reviewedByUserId: null,
    reviewedAt: null,
  });
}

export async function enqueueChatMessageBodyReviewCandidate(input: {
  caseId: string;
  messageId: string;
  body: string;
}) {
  const bodyText = input.body.trim() || "(내용 없음)";
  return persistPortalReviewCandidate({
    caseId: input.caseId,
    itemId: clientStatementItemIdFromMessage(input.messageId),
    sourcePhase: "PHASE_15C",
    itemCategory: "client_statement",
    aiText: bodyText,
    payloadJson: { messageId: input.messageId, source: "CHAT_MESSAGE" },
  });
}

export async function enqueueChatMessageAttachmentReviewCandidate(input: {
  caseId: string;
  messageId: string;
  uploadedFileId: string;
  originalFileName: string;
}) {
  return persistPortalReviewCandidate({
    caseId: input.caseId,
    itemId: clientEvidenceItemIdFromMessageAttachment(input.messageId, input.uploadedFileId),
    sourcePhase: "PHASE_15C",
    sourceFileId: input.uploadedFileId,
    itemCategory: "evidence",
    aiText: input.originalFileName,
    payloadJson: {
      messageId: input.messageId,
      source: "CHAT_ATTACHMENT",
    },
  });
}

export async function enqueueChatMessageReviewCandidates(input: {
  caseId: string;
  messageId: string;
  body: string;
  attachments: Array<{ uploadedFileId: string; originalFileName: string }>;
}) {
  await enqueueChatMessageBodyReviewCandidate({
    caseId: input.caseId,
    messageId: input.messageId,
    body: input.body,
  });

  for (const attachment of input.attachments) {
    await enqueueChatMessageAttachmentReviewCandidate({
      caseId: input.caseId,
      messageId: input.messageId,
      uploadedFileId: attachment.uploadedFileId,
      originalFileName: attachment.originalFileName,
    });
  }
}

export function buildPortalReviewItemsFromStoredDecisions(
  decisions: LitigationDocumentIntelligenceReviewDecision[],
): DocumentIntelligenceReviewQueueItem[] {
  const items: DocumentIntelligenceReviewQueueItem[] = [];

  for (const decision of decisions) {
    if (decision.sourcePhase !== "PHASE_15B" && decision.sourcePhase !== "PHASE_15C") {
      continue;
    }

    const category =
      decision.itemCategory === "client_statement" || decision.itemCategory === "evidence"
        ? decision.itemCategory
        : "client_statement";

    items.push(
      mergeQueueItem(
        {
          itemId: decision.itemId,
          sourcePhase: decision.sourcePhase,
          sourceFileId: decision.sourceFileId,
          itemCategory: category,
          aiText: decision.aiText,
          displayText: decision.editedText ?? decision.aiText,
          reviewStatus:
            decision.reviewStatus as DocumentIntelligenceReviewQueueItem["reviewStatus"],
          citations: [],
          payload:
            decision.payloadJson && typeof decision.payloadJson === "object"
              ? (decision.payloadJson as Record<string, unknown>)
              : undefined,
        },
        decision,
      ),
    );
  }

  return items;
}

export async function isPortalReviewItemAdopted(caseId: string, itemId: string): Promise<boolean> {
  const existing = await findReviewDecisionByCaseAndItemId(caseId, itemId);
  return existing !== null;
}

export async function enqueueClientSubmissionReviewCandidates(input: {
  caseId: string;
  submissionId: string;
  kind: string;
  message: string | null;
  files: Array<{
    description: string | null;
    uploadedFile: { id: string; originalFileName: string };
  }>;
}) {
  if (input.message?.trim()) {
    await persistPortalReviewCandidate({
      caseId: input.caseId,
      itemId: clientStatementItemIdFromSubmission(input.submissionId),
      sourcePhase: "PHASE_15B",
      itemCategory: "client_statement",
      aiText: input.message.trim(),
      payloadJson: {
        submissionId: input.submissionId,
        submissionKind: input.kind,
        source: "CLIENT_SUBMISSION_MESSAGE",
      },
    });
  }

  for (const file of input.files) {
    const description =
      file.description?.trim() || file.uploadedFile.originalFileName;
    await persistPortalReviewCandidate({
      caseId: input.caseId,
      itemId: clientEvidenceItemIdFromSubmissionFile(
        input.submissionId,
        file.uploadedFile.id,
      ),
      sourcePhase: "PHASE_15B",
      sourceFileId: file.uploadedFile.id,
      itemCategory: "evidence",
      aiText: description,
      payloadJson: {
        submissionId: input.submissionId,
        submissionKind: input.kind,
        source: "CLIENT_SUBMISSION_FILE",
      },
    });
  }
}

export function assertPortalReviewConfirmedForDownstream(item: {
  reviewStatus: string;
  itemId?: string;
}): void {
  if (!isConfirmedReviewStatus(item.reviewStatus)) {
    throw new Error(
      "15-C.2: portal collaboration item requires LAWYER_CONFIRMED before downstream use",
    );
  }
}
