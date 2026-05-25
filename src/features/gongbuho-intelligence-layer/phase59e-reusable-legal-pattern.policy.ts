/**
 * Product Phase 59-E — Reusable Legal Pattern policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type {
  BuildReusableLegalPatternInput,
  ReusableLegalPattern,
} from "./phase59e-reusable-legal-pattern.schema";
import type { GongbuhoLawyerFeedbackLearningTrace } from "./phase59d-lawyer-feedback-learning.schema";

export const PHASE59E_REUSABLE_LEGAL_PATTERN_POLICY_MARKER =
  "phase59e-reusable-legal-pattern-policy" as const;

export const PHASE59E_REUSABLE_LEGAL_PATTERN_ONE_LINE_CRITERION =
  "Phase 59-E promotes lawyer APPROVED / MODIFIED learning traces into anonymized ReusableLegalPattern entries only after source trace, audit, reuse scope, and anonymization checks pass." as const;

export const PHASE59E_BOUNDARY_MARKERS = [
  "NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE",
  "NO_RAW_CLIENT_FACT_IN_PATTERN",
  "NO_PATTERN_WITHOUT_ANONYMIZATION",
  "NO_PATTERN_WITHOUT_LAWYER_APPROVED_OR_MODIFIED_SOURCE",
  "NO_GLOBAL_PATTERN_WITHOUT_EXTRA_GOVERNANCE",
  "NO_CROSS_TENANT_PATTERN_WITHOUT_POLICY",
  "NO_PATTERN_WITHOUT_AUDIT_REF",
  "NO_PATTERN_WITHOUT_SOURCE_TRACE",
  "NO_PATTERN_DIRECTLY_VISIBLE_TO_CLIENT",
  "PATTERN_REUSE_SCOPE_REQUIRED",
] as const;

export function evaluateReusableLegalPatternCreation(input: {
  patternInput: BuildReusableLegalPatternInput;
  sourceTrace: GongbuhoLawyerFeedbackLearningTrace;
}) {
  const blockedReasons: string[] = [];
  const { patternInput, sourceTrace } = input;

  if (sourceTrace.lawyerDecision === "REJECTED") {
    blockedReasons.push("NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE");
  }

  if (
    sourceTrace.lawyerDecision !== "APPROVED" &&
    sourceTrace.lawyerDecision !== "MODIFIED"
  ) {
    blockedReasons.push("NO_PATTERN_WITHOUT_LAWYER_APPROVED_OR_MODIFIED_SOURCE");
  }

  if (patternInput.rawClientFactIncluded !== false || sourceTrace.rawClientFactIncluded !== false) {
    blockedReasons.push("NO_RAW_CLIENT_FACT_IN_PATTERN");
  }

  if (patternInput.anonymizationVerified !== true) {
    blockedReasons.push("NO_PATTERN_WITHOUT_ANONYMIZATION");
  }

  if (!patternInput.sourceTraceIds?.length) {
    blockedReasons.push("NO_PATTERN_WITHOUT_SOURCE_TRACE");
  }

  if (!patternInput.auditRef?.trim()) {
    blockedReasons.push("NO_PATTERN_WITHOUT_AUDIT_REF");
  }

  if (!patternInput.reuseScope) {
    blockedReasons.push("PATTERN_REUSE_SCOPE_REQUIRED");
  }

  if (
    patternInput.reuseScope === "GLOBAL_ANONYMIZED" &&
    patternInput.globalGovernanceApproved !== true
  ) {
    blockedReasons.push("NO_GLOBAL_PATTERN_WITHOUT_EXTRA_GOVERNANCE");
  }

  if (patternInput.clientDirectVisible !== false) {
    blockedReasons.push("NO_PATTERN_DIRECTLY_VISIBLE_TO_CLIENT");
  }

  if (
    sourceTrace.lawyerDecision === "MODIFIED" &&
    patternInput.sourceDecision === "LAWYER_MODIFIED" &&
    !patternInput.modifiedPatternRef?.trim() &&
    !sourceTrace.modifiedSuggestionRef?.trim()
  ) {
    blockedReasons.push("MODIFIED_PATTERN_REF_REQUIRED");
  }

  if (
    sourceTrace.lawyerDecision === "APPROVED" &&
    patternInput.sourceDecision !== "LAWYER_APPROVED"
  ) {
    blockedReasons.push("NO_PATTERN_WITHOUT_LAWYER_APPROVED_OR_MODIFIED_SOURCE");
  }

  if (
    sourceTrace.lawyerDecision === "MODIFIED" &&
    patternInput.sourceDecision !== "LAWYER_MODIFIED"
  ) {
    blockedReasons.push("NO_PATTERN_WITHOUT_LAWYER_APPROVED_OR_MODIFIED_SOURCE");
  }

  if (!patternInput.sourceTraceIds.includes(sourceTrace.traceId)) {
    blockedReasons.push("NO_PATTERN_WITHOUT_SOURCE_TRACE");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE59E_BOUNDARY_MARKERS,
  };
}

export function evaluateReusableLegalPatternReasoningAssist(input: {
  pattern: ReusableLegalPattern;
  targetTenantId: string;
  crossTenantPolicyAllowed?: boolean;
}) {
  const blockedReasons: string[] = [];

  if (input.pattern.status !== "APPROVED_FOR_REUSE") {
    blockedReasons.push("PATTERN_NOT_APPROVED_FOR_REUSE");
  }

  if (input.pattern.rawClientFactIncluded !== false) {
    blockedReasons.push("NO_RAW_CLIENT_FACT_IN_PATTERN");
  }

  if (input.pattern.anonymizationVerified !== true) {
    blockedReasons.push("NO_PATTERN_WITHOUT_ANONYMIZATION");
  }

  if (!input.pattern.sourceTraceIds?.length) {
    blockedReasons.push("NO_PATTERN_WITHOUT_SOURCE_TRACE");
  }

  if (!input.pattern.auditRef?.trim()) {
    blockedReasons.push("NO_PATTERN_WITHOUT_AUDIT_REF");
  }

  if (!input.pattern.reuseScope) {
    blockedReasons.push("PATTERN_REUSE_SCOPE_REQUIRED");
  }

  if (input.pattern.clientDirectVisible !== false) {
    blockedReasons.push("NO_PATTERN_DIRECTLY_VISIBLE_TO_CLIENT");
  }

  if (
    input.pattern.reuseScope === "TENANT_ONLY" &&
    input.pattern.tenantId !== input.targetTenantId &&
    input.crossTenantPolicyAllowed !== true
  ) {
    blockedReasons.push("NO_CROSS_TENANT_PATTERN_WITHOUT_POLICY");
  }

  if (
    input.pattern.reuseScope === "GLOBAL_ANONYMIZED" &&
    input.pattern.tenantId &&
    input.pattern.tenantId !== input.targetTenantId &&
    input.crossTenantPolicyAllowed !== true
  ) {
    blockedReasons.push("NO_CROSS_TENANT_PATTERN_WITHOUT_POLICY");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
  };
}

export function assertReusableLegalPatternCreationAllowed(
  input: Parameters<typeof evaluateReusableLegalPatternCreation>[0],
) {
  const result = evaluateReusableLegalPatternCreation(input);
  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "REUSABLE_LEGAL_PATTERN_BLOCKED");
  }
  return result;
}

export function assertReusableLegalPatternReasoningAssistAllowed(
  input: Parameters<typeof evaluateReusableLegalPatternReasoningAssist>[0],
) {
  const result = evaluateReusableLegalPatternReasoningAssist(input);
  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "REUSABLE_LEGAL_PATTERN_REUSE_BLOCKED");
  }
  return result;
}
