/**
 * Product Phase 59-D — Lawyer Feedback Learning service SSOT.
 */
import {
  assertLawyerFeedbackLearningTraceCreationAllowed,
  evaluateLearningTraceReusability,
} from "./phase59d-lawyer-feedback-learning.policy";
import {
  createLawyerFeedbackLearningTraceInputSchema,
  gongbuhoLawyerFeedbackDecisionLedgerEntrySchema,
  gongbuhoLawyerFeedbackLearningTraceSchema,
  type CreateLawyerFeedbackLearningTraceInput,
  type GongbuhoLawyerFeedbackDecisionLedgerEntry,
  type GongbuhoLawyerFeedbackLearningTrace,
} from "./phase59d-lawyer-feedback-learning.schema";

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_SERVICE_MARKER =
  "phase59d-lawyer-feedback-learning-service" as const;

export function buildLawyerFeedbackDecisionLedgerEntry(input: {
  traceId: string;
  caseId: string;
  tenantId: string;
  sourceBundleId: string;
  aiSuggestionId: string;
  lawyerDecision: CreateLawyerFeedbackLearningTraceInput["lawyerDecision"];
  lawyerReviewerId: string;
  auditRef: string;
  recordedAt?: string;
}): GongbuhoLawyerFeedbackDecisionLedgerEntry {
  return gongbuhoLawyerFeedbackDecisionLedgerEntrySchema.parse({
    ledgerId: `ledger:${input.traceId}`,
    traceId: input.traceId,
    caseId: input.caseId,
    tenantId: input.tenantId,
    sourceBundleId: input.sourceBundleId,
    aiSuggestionId: input.aiSuggestionId,
    lawyerDecision: input.lawyerDecision,
    lawyerReviewerId: input.lawyerReviewerId,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    auditRef: input.auditRef,
    sourceMarker: PHASE59D_LAWYER_FEEDBACK_LEARNING_SERVICE_MARKER,
  });
}

export function createLawyerFeedbackLearningTraceService(
  input: CreateLawyerFeedbackLearningTraceInput,
) {
  const parsed = createLawyerFeedbackLearningTraceInputSchema.parse({
    ...input,
    aiSelfReviewed: false as const,
  });

  const ledger = buildLawyerFeedbackDecisionLedgerEntry({
    traceId: parsed.traceId,
    caseId: parsed.caseId,
    tenantId: parsed.tenantId,
    sourceBundleId: parsed.sourceBundleId,
    aiSuggestionId: parsed.aiSuggestionId,
    lawyerDecision: parsed.lawyerDecision,
    lawyerReviewerId: parsed.lawyerReviewerId,
    auditRef: parsed.auditRef,
    recordedAt: parsed.lawyerReviewedAt,
  });

  assertLawyerFeedbackLearningTraceCreationAllowed({
    ...parsed,
    lawyerDecisionLedgerRef: ledger.ledgerId,
  });

  const trace = gongbuhoLawyerFeedbackLearningTraceSchema.parse({
    ...parsed,
    lawyerDecisionLedgerRef: ledger.ledgerId,
    aiSelfReviewed: false as const,
    createdAt: parsed.lawyerReviewedAt,
  });

  return {
    trace,
    decisionLedger: ledger,
  };
}

export function canReuseLawyerFeedbackLearningTrace(input: {
  trace: GongbuhoLawyerFeedbackLearningTrace;
  targetCaseId: string;
  targetTenantId: string;
  crossTenantPolicyAllowed?: boolean;
}) {
  return evaluateLearningTraceReusability(input);
}
