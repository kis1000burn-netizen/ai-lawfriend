/**
 * Product Phase 50-A — Legal Reliability Action Operations schema SSOT.
 */
import { z } from "zod";

export const PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_VERSION = "50-A.1" as const;

export const PHASE50C_LEGAL_RELIABILITY_ACTION_OPERATIONS_CLIENT_RESPONSE_VERSION = "50-C.1" as const;

export const PHASE50D_LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_VERSION = "50-D.1" as const;

export const PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_MARKER =
  "phase50a-legal-reliability-action-operations-queue" as const;

export const legalReliabilityActionOperationSourcePhaseSchema = z.enum(["49-A", "49-B"]);

export const legalReliabilityActionOperationTypeSchema = z.enum([
  "SUPPLEMENT_REQUEST_OPERATION",
  "EVIDENCE_REQUEST_OPERATION",
]);

export const legalReliabilityActionOperationStatusSchema = z.enum([
  "READY",
  "ASSIGNED",
  "WAITING_TO_SEND",
  "SENT_TO_CLIENT",
  "CLIENT_RESPONDED",
  "EVIDENCE_INTAKE_LINKED",
  "LAWYER_REVIEWING_RESPONSE",
  "NEEDS_MORE_INFO",
  "COMPLETED",
  "REOPENED",
  "DEFERRED",
  "CANCELED",
]);

export const evidenceIntakeSyncStatusSchema = z.enum([
  "NONE",
  "LINKED",
  "UNDER_REVIEW",
  "LAWYER_CONFIRMED",
  "REJECTED",
]);

export const legalReliabilityActionOperationPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const legalReliabilityActionSlaStatusSchema = z.enum([
  "NO_OWNER",
  "NO_DUE_DATE",
  "ON_TRACK",
  "DUE_SOON",
  "OVERDUE",
  "BLOCKED_BY_CLIENT",
  "WAITING_LAWYER_REVIEW",
]);

export const legalReliabilityActionOperationCompletionResultSchema = z.enum([
  "RESOLVED",
  "PARTIALLY_RESOLVED",
  "NEEDS_MORE_INFO",
  "NOT_USEFUL",
  "CANCELED_BY_LAWYER",
  "DEFERRED_BY_LAWYER",
  "REOPENED_BY_LAWYER",
]);

export const legalReliabilityActionOperationSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  tenantId: z.string().nullable().optional(),
  sourcePhase: legalReliabilityActionOperationSourcePhaseSchema,
  sourceActionCandidateId: z.string(),
  supplementRequestId: z.string().nullable().optional(),
  operationType: legalReliabilityActionOperationTypeSchema,
  status: legalReliabilityActionOperationStatusSchema,
  priority: legalReliabilityActionOperationPrioritySchema,
  assignedToUserId: z.string().nullable().optional(),
  assignedByUserId: z.string().nullable().optional(),
  assignedAt: z.string().nullable().optional(),
  assignedToName: z.string().nullable().optional(),
  dueAt: z.string().nullable().optional(),
  slaStatus: legalReliabilityActionSlaStatusSchema,
  slaBadgeLabel: z.string(),
  slaCheckedAt: z.string().nullable().optional(),
  clientResponseReceivedAt: z.string().nullable().optional(),
  clientResponseSummary: z.string().nullable().optional(),
  linkedClientSubmissionIds: z.array(z.string()).default([]),
  linkedUploadedFileIds: z.array(z.string()).default([]),
  linkedEvidenceIntakeIds: z.array(z.string()).default([]),
  linkedClientSubmissionCount: z.number().int().nonnegative().default(0),
  linkedUploadedFileCount: z.number().int().nonnegative().default(0),
  evidenceIntakeStatus: evidenceIntakeSyncStatusSchema,
  lawyerReviewRequired: z.boolean().default(false),
  lawyerReviewedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  completionResult: legalReliabilityActionOperationCompletionResultSchema.nullable().optional(),
  lawyerFacingTitle: z.string(),
  sourceLabel: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createLegalReliabilityActionOperationInputSchema = z.object({
  sourceActionCandidateId: z.string().min(1),
});

export const assignLegalReliabilityActionOperationInputSchema = z.object({
  assignedToUserId: z.string().min(1),
  priority: legalReliabilityActionOperationPrioritySchema.optional(),
});

export const setLegalReliabilityActionOperationDueDateInputSchema = z.object({
  dueAt: z.string().datetime(),
  reason: z.string().optional(),
});

export const listLegalReliabilityActionOperationsQuerySchema = z.object({
  assignedToUserId: z.string().optional(),
  priority: legalReliabilityActionOperationPrioritySchema.optional(),
  slaStatus: legalReliabilityActionSlaStatusSchema.optional(),
  status: legalReliabilityActionOperationStatusSchema.optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  hasClientResponse: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  evidenceIntakeStatus: evidenceIntakeSyncStatusSchema.optional(),
});

export const syncClientResponseToLegalReliabilityOperationInputSchema = z.object({
  supplementRequestId: z.string().min(1),
  clientSubmissionIds: z.array(z.string().min(1)).min(1),
  uploadedFileIds: z.array(z.string().min(1)).default([]),
  responseSummary: z.string().optional(),
});

export const handoffLegalReliabilityActionOperationReviewInputSchema = z.object({
  reviewType: z
    .enum(["CLIENT_RESPONSE_REVIEW", "CLIENT_UPLOADED_EVIDENCE_REVIEW"])
    .optional(),
});

export type LegalReliabilityActionOperation = z.infer<typeof legalReliabilityActionOperationSchema>;
export type LegalReliabilityActionOperationStatus = z.infer<
  typeof legalReliabilityActionOperationStatusSchema
>;
export type EvidenceIntakeSyncStatus = z.infer<typeof evidenceIntakeSyncStatusSchema>;
export type LegalReliabilityActionSlaStatus = z.infer<typeof legalReliabilityActionSlaStatusSchema>;
export type LegalReliabilityActionPriority = z.infer<
  typeof legalReliabilityActionOperationPrioritySchema
>;
export type CreateLegalReliabilityActionOperationInput = z.infer<
  typeof createLegalReliabilityActionOperationInputSchema
>;
export type AssignLegalReliabilityActionOperationInput = z.infer<
  typeof assignLegalReliabilityActionOperationInputSchema
>;
export type SetLegalReliabilityActionOperationDueDateInput = z.infer<
  typeof setLegalReliabilityActionOperationDueDateInputSchema
>;
export type ListLegalReliabilityActionOperationsQuery = z.infer<
  typeof listLegalReliabilityActionOperationsQuerySchema
>;
export type SyncClientResponseToLegalReliabilityOperationInput = z.infer<
  typeof syncClientResponseToLegalReliabilityOperationInputSchema
>;
export type HandoffLegalReliabilityActionOperationReviewInput = z.infer<
  typeof handoffLegalReliabilityActionOperationReviewInputSchema
>;

export type LegalReliabilityEvidenceIntakeLink = {
  operationId: string;
  caseId: string;
  uploadedFileId: string;
  sourceSupplementRequestId: string;
  intakeStatus: "UNDER_REVIEW" | "LAWYER_CONFIRMED" | "REJECTED";
  confirmedEvidenceItemId?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
};

export type LegalReliabilityActionResponseReviewItem = {
  id: string;
  caseId: string;
  operationId: string;
  supplementRequestId: string;
  reviewType: "CLIENT_RESPONSE_REVIEW" | "CLIENT_UPLOADED_EVIDENCE_REVIEW";
  status:
    | "PENDING_LAWYER_REVIEW"
    | "LAWYER_REVIEWING"
    | "LAWYER_CONFIRMED"
    | "LAWYER_REJECTED"
    | "NEEDS_MORE_INFO";
  linkedUploadedFileIds: string[];
  linkedClientSubmissionIds: string[];
  clientVisible: false;
  downstreamAllowed: false;
};
