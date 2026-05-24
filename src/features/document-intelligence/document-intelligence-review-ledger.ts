/**
 * Phase 13-G — Judgment Ledger binding for document intelligence review items.
 * 9-F Ledger subjectKind 확장: DOCUMENT_CLAIM · EVIDENCE_ITEM · DEADLINE 등.
 */
import {
  categoryToLedgerSubjectKind,
  type DocumentIntelligenceLedgerEntry,
  type DocumentIntelligenceReviewQueueItem,
} from "./document-intelligence-review.schema";

export const PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_LEDGER_MARKER =
  "PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_LEDGER" as const;

export function buildLedgerEntryFromReviewItem(
  item: Pick<
    DocumentIntelligenceReviewQueueItem,
    | "itemId"
    | "sourcePhase"
    | "itemCategory"
    | "aiText"
    | "reviewStatus"
    | "editedText"
    | "rejectionReason"
  >,
  judgedAt: string,
): DocumentIntelligenceLedgerEntry {
  const judgmentState =
    item.reviewStatus === "LAWYER_CONFIRMED"
      ? "CONFIRMED"
      : item.reviewStatus === "LAWYER_CORRECTED"
        ? "EDITED"
        : item.reviewStatus === "REJECTED"
          ? "REJECTED"
          : "PENDING";

  return {
    entryId: `doc-intel-${item.itemId}`,
    subjectKind: categoryToLedgerSubjectKind(item.itemCategory),
    subjectId: item.itemId,
    aiDetectedText: item.aiText.slice(0, 4000),
    judgmentState,
    lawyerEditedText: item.editedText?.slice(0, 4000),
    rejectionReason: item.rejectionReason?.slice(0, 500),
    clientVisible: false,
    submissionReady: false,
    sourcePhase: item.sourcePhase,
    reviewItemId: item.itemId,
  };
}

export function mergeLedgerEntries(
  existing: DocumentIntelligenceLedgerEntry[],
  entry: DocumentIntelligenceLedgerEntry,
): DocumentIntelligenceLedgerEntry[] {
  const idx = existing.findIndex((e) => e.entryId === entry.entryId);
  if (idx >= 0) {
    const next = [...existing];
    next[idx] = entry;
    return next;
  }
  return [...existing, entry];
}
