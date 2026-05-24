/**
 * Phase 13-G — Lawyer Review Gate schema SSOT.
 * 13-D/E/F 분석 후보 → 변호사 검토 큐 · Ledger 바인딩 · 확정 전 downstream 금지.
 */
import { z } from "zod";
import { documentItemReviewStatusSchema } from "./document-analysis.schema";

export const PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_MARKER =
  "PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW" as const;

export const DOCUMENT_INTELLIGENCE_REVIEW_VERSION = "13-G.2" as const;

export const DOCUMENT_INTELLIGENCE_REVIEW_PHASE_VALUES = [
  "PHASE_13D",
  "PHASE_13E",
  "PHASE_13F",
  "PHASE_15B",
  "PHASE_15C",
] as const;

export const documentIntelligenceReviewPhaseSchema = z.enum(
  DOCUMENT_INTELLIGENCE_REVIEW_PHASE_VALUES,
);

export const DOCUMENT_INTELLIGENCE_REVIEW_CATEGORY_VALUES = [
  "claim",
  "evidence",
  "deadline",
  "issue",
  "question",
  "supplement_draft",
  "defense",
  "contradiction",
  "rebuttal",
  "risk",
  "draft_context",
  "client_statement",
] as const;

export const documentIntelligenceReviewCategorySchema = z.enum(
  DOCUMENT_INTELLIGENCE_REVIEW_CATEGORY_VALUES,
);

/** API/UI 표시용 결정 상태 */
export const DOCUMENT_INTELLIGENCE_REVIEW_DECISION_LABELS = {
  NEEDS_LAWYER_REVIEW: "PENDING",
  LAWYER_CONFIRMED: "CONFIRMED",
  LAWYER_CORRECTED: "EDITED",
  REJECTED: "REJECTED",
  NEEDS_CLIENT_CONFIRMATION: "NEEDS_CLIENT_CONFIRMATION",
} as const;

export const DOCUMENT_INTELLIGENCE_LEDGER_SUBJECT_KINDS = [
  "DOCUMENT_CLAIM",
  "EVIDENCE_ITEM",
  "DEADLINE",
  "LEGAL_ISSUE",
  "CLIENT_QUESTION",
  "SUPPLEMENT_DRAFT",
  "CLIENT_STATEMENT",
] as const;

export const documentIntelligenceLedgerSubjectKindSchema = z.enum(
  DOCUMENT_INTELLIGENCE_LEDGER_SUBJECT_KINDS,
);

export const documentIntelligenceReviewCitationSchema = z.object({
  pageNumber: z.number().int().positive().optional(),
  snippet: z.string().min(1),
  reason: z.string().min(1),
  sourceFileId: z.string().optional(),
});

export const documentIntelligenceReviewQueueItemSchema = z.object({
  itemId: z.string().min(1),
  sourcePhase: documentIntelligenceReviewPhaseSchema,
  sourceFileId: z.string().nullable().optional(),
  sourceFileName: z.string().optional(),
  itemCategory: documentIntelligenceReviewCategorySchema,
  ledgerSubjectKind: documentIntelligenceLedgerSubjectKindSchema,
  aiText: z.string().min(1),
  displayText: z.string().min(1),
  reviewStatus: documentItemReviewStatusSchema,
  decisionLabel: z.string().min(1),
  editedText: z.string().optional(),
  rejectionReason: z.string().optional(),
  reviewNote: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  citations: z.array(documentIntelligenceReviewCitationSchema).default([]),
  payload: z.record(z.unknown()).optional(),
  ledgerEntryId: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  reviewedByUserId: z.string().optional(),
  downstreamUsable: z.boolean(),
});

export type DocumentIntelligenceReviewQueueItem = z.infer<
  typeof documentIntelligenceReviewQueueItemSchema
>;

export const documentIntelligenceReviewQueueSummarySchema = z.object({
  totalCount: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  confirmedCount: z.number().int().nonnegative(),
  editedCount: z.number().int().nonnegative(),
  rejectedCount: z.number().int().nonnegative(),
  needsClientConfirmationCount: z.number().int().nonnegative(),
  phase13dCount: z.number().int().nonnegative(),
  phase13eCount: z.number().int().nonnegative(),
  phase13fCount: z.number().int().nonnegative(),
  phase15bCount: z.number().int().nonnegative().default(0),
  phase15cCount: z.number().int().nonnegative().default(0),
});

export const documentIntelligenceReviewQueueResponseSchema = z.object({
  caseId: z.string().cuid(),
  version: z.literal(DOCUMENT_INTELLIGENCE_REVIEW_VERSION),
  builtAt: z.string().datetime(),
  summary: documentIntelligenceReviewQueueSummarySchema,
  items: z.array(documentIntelligenceReviewQueueItemSchema),
});

export type DocumentIntelligenceReviewQueueResponse = z.infer<
  typeof documentIntelligenceReviewQueueResponseSchema
>;

export const documentIntelligenceReviewEditBodySchema = z.object({
  editedText: z.string().min(1).max(4000),
  reviewNote: z.string().max(2000).optional(),
});

export const documentIntelligenceReviewRejectBodySchema = z.object({
  rejectionReason: z.string().min(1).max(500),
  reviewNote: z.string().max(2000).optional(),
});

export const documentIntelligenceReviewNoteBodySchema = z.object({
  reviewNote: z.string().max(2000).optional(),
});

export const documentIntelligenceLedgerEntrySchema = z.object({
  entryId: z.string().min(1),
  subjectKind: documentIntelligenceLedgerSubjectKindSchema,
  subjectId: z.string().min(1),
  aiDetectedText: z.string().min(1),
  judgmentState: z.enum(["PENDING", "CONFIRMED", "REJECTED", "EDITED"]),
  lawyerEditedText: z.string().optional(),
  rejectionReason: z.string().optional(),
  clientVisible: z.literal(false),
  submissionReady: z.literal(false),
  sourcePhase: documentIntelligenceReviewPhaseSchema,
  reviewItemId: z.string().min(1),
});

export type DocumentIntelligenceLedgerEntry = z.infer<
  typeof documentIntelligenceLedgerEntrySchema
>;

/** 13-G — 확정 전 downstream 사용 금지 validator 키 */
export const FORBIDDEN_DOWNSTREAM_WITHOUT_CONFIRM_KEYS = [
  "clientVisible",
  "submissionReady",
  "confirmedFact",
  "filingReady",
] as const;

export function isConfirmedReviewStatus(reviewStatus: string): boolean {
  return (
    reviewStatus === "LAWYER_CONFIRMED" || reviewStatus === "LAWYER_CORRECTED"
  );
}

export function toDecisionLabel(reviewStatus: string): string {
  return (
    DOCUMENT_INTELLIGENCE_REVIEW_DECISION_LABELS[
      reviewStatus as keyof typeof DOCUMENT_INTELLIGENCE_REVIEW_DECISION_LABELS
    ] ?? "PENDING"
  );
}

export function categoryToLedgerSubjectKind(
  category: z.infer<typeof documentIntelligenceReviewCategorySchema>,
): z.infer<typeof documentIntelligenceLedgerSubjectKindSchema> {
  switch (category) {
    case "evidence":
      return "EVIDENCE_ITEM";
    case "deadline":
      return "DEADLINE";
    case "question":
      return "CLIENT_QUESTION";
    case "supplement_draft":
      return "SUPPLEMENT_DRAFT";
    case "client_statement":
      return "CLIENT_STATEMENT";
    case "issue":
    case "contradiction":
    case "rebuttal":
    case "risk":
    case "defense":
    case "draft_context":
      return "LEGAL_ISSUE";
    case "claim":
    default:
      return "DOCUMENT_CLAIM";
  }
}
