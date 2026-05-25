/**
 * Product Phase 59-D — Lawyer Feedback Learning policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type {
  CreateLawyerFeedbackLearningTraceInput,
  GongbuhoLawyerFeedbackLearningTrace,
} from "./phase59d-lawyer-feedback-learning.schema";

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_POLICY_MARKER =
  "phase59d-lawyer-feedback-learning-policy" as const;

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_ONE_LINE_CRITERION =
  "Phase 59-D records lawyer APPROVED / MODIFIED / REJECTED decisions on 59-C reasoning candidates as GongbuhoLearningTrace entries and allows reuse only through anonymized, audited, lawyer-gated feedback loops." as const;

export const PHASE59D_BOUNDARY_MARKERS = [
  "NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION",
  "NO_REJECTED_SUGGESTION_REUSE",
  "NO_RAW_CLIENT_FACT_IN_REUSABLE_TRACE",
  "NO_GLOBAL_REUSE_WITHOUT_ANONYMIZATION",
  "NO_CROSS_TENANT_LEARNING_WITHOUT_POLICY",
  "NO_AI_SELF_REINFORCEMENT_WITHOUT_REVIEW",
  "NO_LEARNING_TRACE_WITHOUT_SOURCE_BUNDLE",
  "NO_LEARNING_TRACE_WITHOUT_AUDIT_REF",
  "LAWYER_DECISION_LEDGER_REQUIRED",
] as const;

export function evaluateLawyerFeedbackLearningTraceCreation(
  input: Omit<CreateLawyerFeedbackLearningTraceInput, "aiSelfReviewed"> & {
    lawyerDecisionLedgerRef?: string;
    aiSelfReviewed?: boolean;
  },
) {
  const blockedReasons: string[] = [];

  if (!input.lawyerDecision) {
    blockedReasons.push("NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION");
  }

  if (!input.sourceBundleId?.trim()) {
    blockedReasons.push("NO_LEARNING_TRACE_WITHOUT_SOURCE_BUNDLE");
  }

  if (!input.auditRef?.trim()) {
    blockedReasons.push("NO_LEARNING_TRACE_WITHOUT_AUDIT_REF");
  }

  if (!input.lawyerDecisionLedgerRef?.trim()) {
    blockedReasons.push("LAWYER_DECISION_LEDGER_REQUIRED");
  }

  if (input.aiSelfReviewed === true) {
    blockedReasons.push("NO_AI_SELF_REINFORCEMENT_WITHOUT_REVIEW");
  }

  if (input.rawClientFactIncluded !== false) {
    blockedReasons.push("NO_RAW_CLIENT_FACT_IN_REUSABLE_TRACE");
  }

  if (
    input.reusableScope === "SAME_CASE_TYPE_ANONYMIZED" &&
    input.anonymizedPatternRequired !== true
  ) {
    blockedReasons.push("NO_GLOBAL_REUSE_WITHOUT_ANONYMIZATION");
  }

  if (input.lawyerDecision === "REJECTED" && input.reusable) {
    blockedReasons.push("NO_REJECTED_SUGGESTION_REUSE");
  }

  if (input.lawyerDecision === "MODIFIED" && input.reusable && !input.modifiedSuggestionRef?.trim()) {
    blockedReasons.push("MODIFIED_SUGGESTION_REF_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE59D_BOUNDARY_MARKERS,
  };
}

export function evaluateLearningTraceReusability(input: {
  trace: GongbuhoLawyerFeedbackLearningTrace;
  targetCaseId: string;
  targetTenantId: string;
  crossTenantPolicyAllowed?: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.trace.reusable) {
    blockedReasons.push("LEARNING_TRACE_NOT_MARKED_REUSABLE");
  }

  if (input.trace.lawyerDecision === "REJECTED") {
    blockedReasons.push("NO_REJECTED_SUGGESTION_REUSE");
  }

  if (input.trace.rawClientFactIncluded !== false) {
    blockedReasons.push("NO_RAW_CLIENT_FACT_IN_REUSABLE_TRACE");
  }

  if (input.trace.aiSelfReviewed !== false) {
    blockedReasons.push("NO_AI_SELF_REINFORCEMENT_WITHOUT_REVIEW");
  }

  if (
    input.trace.lawyerDecision === "MODIFIED" &&
    !input.trace.modifiedSuggestionRef?.trim()
  ) {
    blockedReasons.push("MODIFIED_SUGGESTION_REF_REQUIRED");
  }

  if (
    input.trace.reusableScope === "SAME_CASE_TYPE_ANONYMIZED" &&
    input.trace.anonymizedPatternRequired !== true
  ) {
    blockedReasons.push("NO_GLOBAL_REUSE_WITHOUT_ANONYMIZATION");
  }

  if (input.trace.reusableScope === "CASE_ONLY") {
    if (input.trace.caseId !== input.targetCaseId) {
      blockedReasons.push("CASE_ONLY_REUSE_SCOPE_VIOLATION");
    }
    if (input.trace.tenantId !== input.targetTenantId) {
      blockedReasons.push("NO_CROSS_TENANT_LEARNING_WITHOUT_POLICY");
    }
  }

  if (input.trace.reusableScope === "TENANT_ONLY") {
    if (input.trace.tenantId !== input.targetTenantId) {
      blockedReasons.push("NO_CROSS_TENANT_LEARNING_WITHOUT_POLICY");
    }
  }

  if (
    input.trace.reusableScope === "SAME_CASE_TYPE_ANONYMIZED" &&
    input.trace.tenantId !== input.targetTenantId &&
    input.crossTenantPolicyAllowed !== true
  ) {
    blockedReasons.push("NO_CROSS_TENANT_LEARNING_WITHOUT_POLICY");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
  };
}

export function assertLawyerFeedbackLearningTraceCreationAllowed(
  input: Omit<CreateLawyerFeedbackLearningTraceInput, "aiSelfReviewed"> & {
    lawyerDecisionLedgerRef?: string;
    aiSelfReviewed?: boolean;
  },
) {
  const result = evaluateLawyerFeedbackLearningTraceCreation(input);
  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "LAWYER_FEEDBACK_LEARNING_TRACE_BLOCKED");
  }
  return result;
}

export function assertLearningTraceReusable(input: Parameters<
  typeof evaluateLearningTraceReusability
>[0]) {
  const result = evaluateLearningTraceReusability(input);
  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "LEARNING_TRACE_REUSE_BLOCKED");
  }
  return result;
}
