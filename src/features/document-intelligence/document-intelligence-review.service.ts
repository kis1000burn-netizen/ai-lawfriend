/**
 * Phase 13-G — Lawyer Review Gate service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  auditDocumentIntelligenceReviewClientConfirmation,
  auditDocumentIntelligenceReviewConfirmed,
  auditDocumentIntelligenceReviewEdited,
  auditDocumentIntelligenceReviewRejected,
} from "./document-intelligence-review-audit";
import { buildLedgerEntryFromReviewItem } from "./document-intelligence-review-ledger";
import { buildDocumentIntelligenceReviewQueue } from "./document-intelligence-review-queue.builder";
import {
  assertCanDecideDocumentIntelligenceReviewItem,
  assertCanReadDocumentIntelligenceReviewQueue,
} from "./document-intelligence-review.policy";
import {
  documentIntelligenceReviewEditBodySchema,
  documentIntelligenceReviewNoteBodySchema,
  documentIntelligenceReviewRejectBodySchema,
  type DocumentIntelligenceReviewQueueItem,
  type DocumentIntelligenceReviewQueueResponse,
} from "./document-intelligence-review.schema";
import {
  loadReviewQueueSourceData,
  upsertReviewDecision,
} from "./document-intelligence-review.repository";
import { validateReviewQueueResponse } from "./document-intelligence-review.validator";

export const PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_SERVICE_MARKER =
  "PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_SERVICE" as const;

async function buildQueueForCase(
  caseId: string,
): Promise<DocumentIntelligenceReviewQueueResponse> {
  const source = await loadReviewQueueSourceData(caseId);
  const queue = buildDocumentIntelligenceReviewQueue({
    caseId,
    litigationFiles: source.litigationFiles,
    evidenceMapping: source.evidenceMapping,
    decisions: source.decisions,
    portalSources: source.portalSources,
  });
  return validateReviewQueueResponse(queue);
}

function findQueueItem(
  queue: DocumentIntelligenceReviewQueueResponse,
  itemId: string,
): DocumentIntelligenceReviewQueueItem {
  const item = queue.items.find((i) => i.itemId === itemId);
  if (!item) {
    throw new NotFoundError("검토 큐 항목을 찾을 수 없습니다.");
  }
  return item;
}

async function persistDecision(
  currentUser: SessionUser,
  caseId: string,
  item: DocumentIntelligenceReviewQueueItem,
  update: {
    reviewStatus: DocumentIntelligenceReviewQueueItem["reviewStatus"];
    editedText?: string | null;
    rejectionReason?: string | null;
    reviewNote?: string | null;
  },
) {
  const judgedAt = new Date().toISOString();
  const ledgerEntry = buildLedgerEntryFromReviewItem(
    {
      ...item,
      ...update,
      editedText: update.editedText ?? item.editedText,
      rejectionReason: update.rejectionReason ?? item.rejectionReason,
    },
    judgedAt,
  );

  await upsertReviewDecision({
    caseId,
    itemId: item.itemId,
    sourcePhase: item.sourcePhase,
    sourceFileId: item.sourceFileId,
    itemCategory: item.itemCategory,
    aiText: item.aiText,
    reviewStatus: update.reviewStatus,
    editedText: update.editedText ?? null,
    rejectionReason: update.rejectionReason ?? null,
    reviewNote: update.reviewNote ?? null,
    ledgerEntryJson: ledgerEntry,
    payloadJson: item.payload,
    reviewedByUserId: currentUser.id,
    reviewedAt: new Date(),
  });
}

export async function getDocumentIntelligenceReviewQueueService(
  currentUser: SessionUser,
  caseId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadDocumentIntelligenceReviewQueue(access);
  return buildQueueForCase(caseId);
}

export async function confirmDocumentIntelligenceReviewItemService(
  currentUser: SessionUser,
  caseId: string,
  itemId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanDecideDocumentIntelligenceReviewItem(access);

  const parsedBody = documentIntelligenceReviewNoteBodySchema.parse(body ?? {});
  const queue = await buildQueueForCase(caseId);
  const item = findQueueItem(queue, itemId);

  await persistDecision(currentUser, caseId, item, {
    reviewStatus: "LAWYER_CONFIRMED",
    reviewNote: parsedBody.reviewNote,
  });

  await auditDocumentIntelligenceReviewConfirmed({
    actorUserId: currentUser.id,
    caseId,
    itemId,
    itemCategory: item.itemCategory,
    sourcePhase: item.sourcePhase,
  });

  return { caseId, itemId, queue: await buildQueueForCase(caseId) };
}

export async function editDocumentIntelligenceReviewItemService(
  currentUser: SessionUser,
  caseId: string,
  itemId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanDecideDocumentIntelligenceReviewItem(access);

  const parsedBody = documentIntelligenceReviewEditBodySchema.parse(body);
  const queue = await buildQueueForCase(caseId);
  const item = findQueueItem(queue, itemId);

  await persistDecision(currentUser, caseId, item, {
    reviewStatus: "LAWYER_CORRECTED",
    editedText: parsedBody.editedText,
    reviewNote: parsedBody.reviewNote,
  });

  await auditDocumentIntelligenceReviewEdited({
    actorUserId: currentUser.id,
    caseId,
    itemId,
    itemCategory: item.itemCategory,
    sourcePhase: item.sourcePhase,
  });

  return { caseId, itemId, queue: await buildQueueForCase(caseId) };
}

export async function rejectDocumentIntelligenceReviewItemService(
  currentUser: SessionUser,
  caseId: string,
  itemId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanDecideDocumentIntelligenceReviewItem(access);

  const parsedBody = documentIntelligenceReviewRejectBodySchema.parse(body);
  const queue = await buildQueueForCase(caseId);
  const item = findQueueItem(queue, itemId);

  await persistDecision(currentUser, caseId, item, {
    reviewStatus: "REJECTED",
    rejectionReason: parsedBody.rejectionReason,
    reviewNote: parsedBody.reviewNote,
  });

  await auditDocumentIntelligenceReviewRejected({
    actorUserId: currentUser.id,
    caseId,
    itemId,
    itemCategory: item.itemCategory,
    sourcePhase: item.sourcePhase,
    rejectionReason: parsedBody.rejectionReason,
  });

  return { caseId, itemId, queue: await buildQueueForCase(caseId) };
}

export async function requestClientConfirmationReviewItemService(
  currentUser: SessionUser,
  caseId: string,
  itemId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanDecideDocumentIntelligenceReviewItem(access);

  const parsedBody = documentIntelligenceReviewNoteBodySchema.parse(body ?? {});
  const queue = await buildQueueForCase(caseId);
  const item = findQueueItem(queue, itemId);

  if (item.itemCategory !== "question" && item.itemCategory !== "supplement_draft") {
    throw new ValidationError(
      "의뢰인 확인 요청은 question·supplement_draft 항목에만 적용할 수 있습니다.",
    );
  }

  await persistDecision(currentUser, caseId, item, {
    reviewStatus: "NEEDS_CLIENT_CONFIRMATION",
    reviewNote: parsedBody.reviewNote,
  });

  await auditDocumentIntelligenceReviewClientConfirmation({
    actorUserId: currentUser.id,
    caseId,
    itemId,
    itemCategory: item.itemCategory,
    sourcePhase: item.sourcePhase,
  });

  return { caseId, itemId, queue: await buildQueueForCase(caseId) };
}
