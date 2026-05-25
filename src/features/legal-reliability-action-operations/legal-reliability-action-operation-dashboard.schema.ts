/**
 * Product Phase 50-E — Command Center Execution Dashboard schema SSOT.
 */
import { z } from "zod";
import { PHASE50E_LOCKED_BOUNDARIES } from "./phase50e-command-center-execution-dashboard.lock";

export const LEGAL_RELIABILITY_ACTION_OPERATION_DASHBOARD_PHASE = "50-E" as const;

export { PHASE50E_LOCKED_BOUNDARIES };

export const legalReliabilityActionOperationDashboardFilterSchema = z.enum([
  "ALL",
  "NEEDS_ATTENTION",
  "OVERDUE",
  "DUE_SOON",
  "CLIENT_RESPONDED",
  "EVIDENCE_UNDER_REVIEW",
  "LAWYER_REVIEW_REQUIRED",
  "COMPLETED",
]);

export const legalReliabilityActionOperationDownstreamReadinessSchema = z.object({
  operationId: z.string(),
  courtReadyAllowed: z.boolean(),
  draftContextAllowed: z.boolean(),
  graphUpdateAllowed: z.boolean(),
  evidenceUseAllowed: z.boolean(),
  blockedReasons: z.array(z.string()),
});

export const legalReliabilityActionOperationDashboardRowSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  status: z.string(),
  priority: z.string().nullable().optional(),
  slaStatus: z.string().nullable().optional(),
  assignedToUserId: z.string().nullable().optional(),
  dueAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  bucket: z.string(),
  attentionScore: z.number(),
  uploadedFileCount: z.number().int().nonnegative(),
  clientSubmissionCount: z.number().int().nonnegative(),
  evidenceIntakeStatus: z.string().nullable().optional(),
  clientResponseReceivedAt: z.string().nullable().optional(),
  downstreamReadiness: legalReliabilityActionOperationDownstreamReadinessSchema,
});

export const legalReliabilityActionOperationDashboardSummarySchema = z.object({
  caseId: z.string(),
  total: z.number().int().nonnegative(),
  byStatus: z.object({
    ready: z.number().int().nonnegative(),
    assigned: z.number().int().nonnegative(),
    waitingToSend: z.number().int().nonnegative(),
    sentToClient: z.number().int().nonnegative(),
    clientResponded: z.number().int().nonnegative(),
    evidenceIntakeLinked: z.number().int().nonnegative(),
    lawyerReviewingResponse: z.number().int().nonnegative(),
    needsMoreInfo: z.number().int().nonnegative(),
    reopened: z.number().int().nonnegative(),
    deferred: z.number().int().nonnegative(),
    canceled: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
  }),
  bySla: z.object({
    noOwner: z.number().int().nonnegative(),
    noDueDate: z.number().int().nonnegative(),
    onTrack: z.number().int().nonnegative(),
    dueSoon: z.number().int().nonnegative(),
    overdue: z.number().int().nonnegative(),
    blockedByClient: z.number().int().nonnegative(),
    waitingLawyerReview: z.number().int().nonnegative(),
  }),
  byPriority: z.object({
    low: z.number().int().nonnegative(),
    medium: z.number().int().nonnegative(),
    high: z.number().int().nonnegative(),
    urgent: z.number().int().nonnegative(),
  }),
  response: z.object({
    clientRespondedCount: z.number().int().nonnegative(),
    uploadedFileCount: z.number().int().nonnegative(),
    evidenceUnderReviewCount: z.number().int().nonnegative(),
    lawyerReviewRequiredCount: z.number().int().nonnegative(),
  }),
  downstream: z.object({
    courtReadyAllowedCount: z.number().int().nonnegative(),
    blockedByUnreviewedEvidenceCount: z.number().int().nonnegative(),
    blockedByNoLawyerCompletionCount: z.number().int().nonnegative(),
  }),
  attention: z.object({
    needsImmediateAttentionCount: z.number().int().nonnegative(),
    overdueOrUrgentCount: z.number().int().nonnegative(),
    dueSoonCount: z.number().int().nonnegative(),
    waitingLawyerReviewCount: z.number().int().nonnegative(),
  }),
  rows: z.array(legalReliabilityActionOperationDashboardRowSchema),
});

export type LegalReliabilityActionOperationDashboardFilter = z.infer<
  typeof legalReliabilityActionOperationDashboardFilterSchema
>;
export type LegalReliabilityActionOperationDownstreamReadiness = z.infer<
  typeof legalReliabilityActionOperationDownstreamReadinessSchema
>;
export type LegalReliabilityActionOperationDashboardSummary = z.infer<
  typeof legalReliabilityActionOperationDashboardSummarySchema
>;
export type LegalReliabilityActionOperationDashboardRow = z.infer<
  typeof legalReliabilityActionOperationDashboardRowSchema
>;

export type LegalReliabilityActionOperationDashboardBucket =
  | "NEEDS_ASSIGNMENT"
  | "READY_TO_SEND"
  | "WAITING_CLIENT"
  | "CLIENT_RESPONSE_ARRIVED"
  | "EVIDENCE_UNDER_REVIEW"
  | "LAWYER_REVIEW_REQUIRED"
  | "NEEDS_MORE_INFO"
  | "REOPENED"
  | "DEFERRED"
  | "COMPLETED"
  | "CANCELED";
