/**
 * Product Phase 59-D — Lawyer Feedback Learning schema SSOT.
 * @see docs/gongbuho/AIBEOPCHIN_GONGBUHO_LAWYER_FEEDBACK_LEARNING_PHASE59D.md
 */
import { z } from "zod";

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_VERSION = "59-D.1" as const;

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_SCHEMA_MARKER =
  "phase59d-lawyer-feedback-learning-schema" as const;

export const gongbuhoLawyerFeedbackSuggestionTypeSchema = z.enum([
  "WEAKNESS",
  "COUNTER_ARGUMENT",
  "EVIDENCE_GAP",
  "CLAIM_EVIDENCE_LINK",
  "JUDGMENT_LINK",
]);

export const gongbuhoLawyerFeedbackDecisionSchema = z.enum([
  "APPROVED",
  "MODIFIED",
  "REJECTED",
]);

export const gongbuhoLawyerFeedbackReusableScopeSchema = z.enum([
  "CASE_ONLY",
  "TENANT_ONLY",
  "SAME_CASE_TYPE_ANONYMIZED",
]);

export const gongbuhoLawyerFeedbackLearningTraceSchema = z.object({
  traceId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  sourceBundleId: z.string().min(1),
  suggestionType: gongbuhoLawyerFeedbackSuggestionTypeSchema,
  aiSuggestionId: z.string().min(1),
  lawyerDecision: gongbuhoLawyerFeedbackDecisionSchema,
  lawyerReviewedAt: z.string().datetime(),
  lawyerReviewerId: z.string().min(1),
  modifiedSuggestionRef: z.string().min(1).optional(),
  reusable: z.boolean(),
  reusableScope: gongbuhoLawyerFeedbackReusableScopeSchema,
  rawClientFactIncluded: z.literal(false),
  anonymizedPatternRequired: z.boolean(),
  auditRef: z.string().min(1),
  lawyerDecisionLedgerRef: z.string().min(1),
  aiSelfReviewed: z.literal(false),
  createdAt: z.string().datetime(),
});

export const createLawyerFeedbackLearningTraceInputSchema = z.object({
  traceId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  sourceBundleId: z.string().min(1),
  suggestionType: gongbuhoLawyerFeedbackSuggestionTypeSchema,
  aiSuggestionId: z.string().min(1),
  lawyerDecision: gongbuhoLawyerFeedbackDecisionSchema,
  lawyerReviewedAt: z.string().datetime(),
  lawyerReviewerId: z.string().min(1),
  modifiedSuggestionRef: z.string().min(1).optional(),
  reusable: z.boolean(),
  reusableScope: gongbuhoLawyerFeedbackReusableScopeSchema,
  rawClientFactIncluded: z.literal(false),
  anonymizedPatternRequired: z.boolean(),
  auditRef: z.string().min(1),
  aiSelfReviewed: z.literal(false).optional(),
});

export const gongbuhoLawyerFeedbackDecisionLedgerEntrySchema = z.object({
  ledgerId: z.string().min(1),
  traceId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  sourceBundleId: z.string().min(1),
  aiSuggestionId: z.string().min(1),
  lawyerDecision: gongbuhoLawyerFeedbackDecisionSchema,
  lawyerReviewerId: z.string().min(1),
  recordedAt: z.string().datetime(),
  auditRef: z.string().min(1),
  sourceMarker: z.literal("phase59d-lawyer-feedback-learning-service"),
});

export type GongbuhoLawyerFeedbackLearningTrace = z.infer<
  typeof gongbuhoLawyerFeedbackLearningTraceSchema
>;
export type CreateLawyerFeedbackLearningTraceInput = z.infer<
  typeof createLawyerFeedbackLearningTraceInputSchema
>;
export type GongbuhoLawyerFeedbackDecisionLedgerEntry = z.infer<
  typeof gongbuhoLawyerFeedbackDecisionLedgerEntrySchema
>;
