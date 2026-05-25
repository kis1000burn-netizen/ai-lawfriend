/**
 * Product Phase 50-D — Lawyer Completion Review schema SSOT.
 */
import { z } from "zod";
import { legalReliabilityActionOperationCompletionResultSchema } from "./legal-reliability-action-operation.schema";

export const LEGAL_RELIABILITY_ACTION_OPERATION_COMPLETION_PHASE = "50-D" as const;

export const legalReliabilityActionOperationCompletionDecisionSchema = z.enum([
  "MARK_COMPLETED",
  "REQUEST_MORE_INFO",
  "REOPEN",
  "DEFER",
  "CANCEL",
]);

export const legalReliabilityActionOperationCompletionStatusSchema = z.enum([
  "COMPLETED",
  "NEEDS_MORE_INFO",
  "REOPENED",
  "DEFERRED",
  "CANCELED",
]);

export const evidenceIntakeReviewDecisionSchema = z.enum([
  "LAWYER_CONFIRMED",
  "LAWYER_REJECTED",
  "NEEDS_MORE_REVIEW",
]);

export const completeLegalReliabilityActionOperationBodySchema = z.object({
  completionResult: legalReliabilityActionOperationCompletionResultSchema.optional(),
  lawyerReviewNote: z.string().optional(),
  evidenceIntakeDecision: evidenceIntakeReviewDecisionSchema.optional(),
  confirmedEvidenceItemIds: z.array(z.string().min(1)).default([]),
  rejectedUploadedFileIds: z.array(z.string().min(1)).default([]),
});

export const requestMoreInfoLegalReliabilityActionOperationBodySchema = z.object({
  requestMoreInfoReason: z.string().min(1).optional(),
  lawyerReviewNote: z.string().optional(),
  evidenceIntakeDecision: evidenceIntakeReviewDecisionSchema.optional(),
});

export const completionReasonBodySchema = z.object({
  reason: z.string().min(1).optional(),
  lawyerReviewNote: z.string().optional(),
});

export const PHASE50D_LOCKED_BOUNDARIES = [
  "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION",
  "NO_CLIENT_RESPONSE_AUTO_COMPLETION",
  "NO_AI_COMPLETION_DECISION",
  "NO_EVIDENCE_CONFIRMATION_WITHOUT_LAWYER_REVIEW",
  "COMPLETION_DECISION_LEDGER_REQUIRED",
  "NO_COURT_READY_USE_WITHOUT_CONFIRMED_REVIEW",
] as const;

export type LegalReliabilityActionOperationCompletionDecision = z.infer<
  typeof legalReliabilityActionOperationCompletionDecisionSchema
>;
export type LegalReliabilityActionOperationCompletionResult = z.infer<
  typeof legalReliabilityActionOperationCompletionResultSchema
>;
export type LegalReliabilityActionOperationCompletionStatus = z.infer<
  typeof legalReliabilityActionOperationCompletionStatusSchema
>;
export type EvidenceIntakeReviewDecision = z.infer<typeof evidenceIntakeReviewDecisionSchema>;

export type CompleteLegalReliabilityActionOperationInput = {
  caseId: string;
  operationId: string;
  actorUserId: string;
  actorRole: "LAWYER" | "ADMIN" | "STAFF" | "CLIENT" | "SYSTEM";

  decision: LegalReliabilityActionOperationCompletionDecision;
  completionResult?: LegalReliabilityActionOperationCompletionResult;

  lawyerReviewNote?: string;
  requestMoreInfoReason?: string;
  reopenReason?: string;
  deferReason?: string;
  cancelReason?: string;

  evidenceIntakeDecision?: EvidenceIntakeReviewDecision;
  confirmedEvidenceItemIds?: string[];
  rejectedUploadedFileIds?: string[];

  now?: Date;
};

export type LegalReliabilityActionOperationCompletionLedgerEntry = {
  id: string;
  caseId: string;
  operationId: string;
  decision: LegalReliabilityActionOperationCompletionDecision;
  completionResult?: LegalReliabilityActionOperationCompletionResult;
  decidedByUserId: string;
  decidedByRole: string;
  lawyerReviewNote?: string;
  evidenceIntakeDecision?: EvidenceIntakeReviewDecision;
  confirmedEvidenceItemIds: string[];
  rejectedUploadedFileIds: string[];
  createdAt: Date;
};
