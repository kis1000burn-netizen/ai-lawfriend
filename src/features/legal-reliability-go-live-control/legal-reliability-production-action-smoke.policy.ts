/**
 * Product Phase 53-D — Production Action Loop / Operations smoke policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_POLICY_MARKER =
  "phase53d-legal-reliability-production-action-smoke-policy" as const;

export const PHASE_53D_BOUNDARY_MARKERS = [
  "NO_PRODUCTION_ACTION_SMOKE_WITHOUT_53A_53B_53C_LOCK",
  "NO_GO_LIVE_WITHOUT_ACTION_LOOP_LIVE_SMOKE",
  "NO_AI_ACTION_WITHOUT_LAWYER_APPROVAL",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_DECISION_LEDGER",
  "NO_OPERATION_QUEUE_WITHOUT_APPROVED_ACTION",
  "NO_AUTO_OPERATION_COMPLETION_IN_PRODUCTION",
  "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION",
  "NO_AUTO_FILING_OR_AUTO_SUBMISSION_IN_PRODUCTION",
  "NO_ACTION_SMOKE_WITHOUT_AUDIT_EVIDENCE",
  "NO_CLIENT_VISIBLE_INTERNAL_STRATEGY_DURING_SMOKE",
] as const;

export function evaluateProductionActionSmokeGate(input: {
  phase53aLocked: boolean;
  phase53bLocked: boolean;
  phase53cLocked: boolean;

  testCaseIsSyntheticOrApproved: boolean;
  allSmokeStepsPassed: boolean;

  riskRadarCandidateCreated: boolean;
  graphGapCandidateCreated: boolean;
  noSupplementRequestBeforeLawyerApproval: boolean;
  lawyerDecisionLedgerRecorded: boolean;
  supplementRequestDraftCreatedAfterApproval: boolean;
  supplementRequestNotAutoSent: boolean;

  operationCreatedFromApprovedActionOnly: boolean;
  assignmentAndDueDateVisible: boolean;
  slaVisibleWithoutAutoEscalation: boolean;
  completionRequiresLawyerReview: boolean;
  autoCompletionDisabled: boolean;

  unreviewedEvidenceDownstreamBlocked: boolean;
  autoFilingDisabled: boolean;
  autoSubmissionDisabled: boolean;
  clientInternalStrategyBlocked: boolean;

  auditLogged: boolean;
  actionCandidateEvidencePresent: boolean;
  decisionLedgerEvidencePresent: boolean;
  operationQueueEvidencePresent: boolean;
  deniedBoundaryEvidencePresent: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase53aLocked || !input.phase53bLocked || !input.phase53cLocked) {
    blockedReasons.push("PHASE_53A_53B_53C_LOCK_REQUIRED");
  }

  if (!input.testCaseIsSyntheticOrApproved) {
    blockedReasons.push("APPROVED_PRODUCTION_TEST_CASE_REQUIRED");
  }

  if (!input.allSmokeStepsPassed) {
    blockedReasons.push("PRODUCTION_ACTION_SMOKE_STEP_FAILED");
  }

  if (!input.riskRadarCandidateCreated || !input.graphGapCandidateCreated) {
    blockedReasons.push("ACTION_CANDIDATE_CREATION_NOT_VERIFIED");
  }

  if (!input.noSupplementRequestBeforeLawyerApproval) {
    blockedReasons.push("CLIENT_REQUEST_CREATED_WITHOUT_LAWYER_APPROVAL");
  }

  if (!input.lawyerDecisionLedgerRecorded) {
    blockedReasons.push("LAWYER_DECISION_LEDGER_REQUIRED");
  }

  if (
    !input.supplementRequestDraftCreatedAfterApproval ||
    !input.supplementRequestNotAutoSent
  ) {
    blockedReasons.push("SUPPLEMENT_REQUEST_DRAFT_ONLY_BOUNDARY_FAILED");
  }

  if (!input.operationCreatedFromApprovedActionOnly) {
    blockedReasons.push("OPERATION_QUEUE_WITHOUT_APPROVED_ACTION");
  }

  if (!input.assignmentAndDueDateVisible) {
    blockedReasons.push("ACTION_OPERATION_ASSIGNMENT_DUE_DATE_NOT_VERIFIED");
  }

  if (!input.slaVisibleWithoutAutoEscalation) {
    blockedReasons.push("SLA_AUTO_ESCALATION_RISK");
  }

  if (!input.completionRequiresLawyerReview || !input.autoCompletionDisabled) {
    blockedReasons.push("AUTO_COMPLETION_OR_REVIEW_BYPASS_RISK");
  }

  if (!input.unreviewedEvidenceDownstreamBlocked) {
    blockedReasons.push("UNREVIEWED_EVIDENCE_DOWNSTREAM_RISK");
  }

  if (!input.autoFilingDisabled || !input.autoSubmissionDisabled) {
    blockedReasons.push("AUTO_FILING_OR_SUBMISSION_RISK");
  }

  if (!input.clientInternalStrategyBlocked) {
    blockedReasons.push("CLIENT_INTERNAL_STRATEGY_VISIBILITY_RISK");
  }

  if (
    !input.auditLogged ||
    !input.actionCandidateEvidencePresent ||
    !input.decisionLedgerEvidencePresent ||
    !input.operationQueueEvidencePresent ||
    !input.deniedBoundaryEvidencePresent
  ) {
    blockedReasons.push("ACTION_SMOKE_AUDIT_EVIDENCE_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE_53D_BOUNDARY_MARKERS,
  };
}

export function assertProductionActionSmokeGateAllowed(
  input: Parameters<typeof evaluateProductionActionSmokeGate>[0],
) {
  const result = evaluateProductionActionSmokeGate(input);

  if (result.blockedReasons.includes("PHASE_53A_53B_53C_LOCK_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_ACTION_SMOKE_WITHOUT_53A_53B_53C_LOCK");
  }
  if (result.blockedReasons.includes("APPROVED_PRODUCTION_TEST_CASE_REQUIRED")) {
    throw new ValidationError("NO_GO_LIVE_WITHOUT_ACTION_LOOP_LIVE_SMOKE");
  }
  if (result.blockedReasons.includes("PRODUCTION_ACTION_SMOKE_STEP_FAILED")) {
    throw new ValidationError("NO_GO_LIVE_WITHOUT_ACTION_LOOP_LIVE_SMOKE");
  }
  if (result.blockedReasons.includes("ACTION_CANDIDATE_CREATION_NOT_VERIFIED")) {
    throw new ValidationError("NO_AI_ACTION_WITHOUT_LAWYER_APPROVAL");
  }
  if (result.blockedReasons.includes("CLIENT_REQUEST_CREATED_WITHOUT_LAWYER_APPROVAL")) {
    throw new ValidationError("NO_AI_ACTION_WITHOUT_LAWYER_APPROVAL");
  }
  if (result.blockedReasons.includes("LAWYER_DECISION_LEDGER_REQUIRED")) {
    throw new ValidationError("NO_CLIENT_REQUEST_WITHOUT_LAWYER_DECISION_LEDGER");
  }
  if (result.blockedReasons.includes("SUPPLEMENT_REQUEST_DRAFT_ONLY_BOUNDARY_FAILED")) {
    throw new ValidationError("NO_CLIENT_REQUEST_WITHOUT_LAWYER_DECISION_LEDGER");
  }
  if (result.blockedReasons.includes("OPERATION_QUEUE_WITHOUT_APPROVED_ACTION")) {
    throw new ValidationError("NO_OPERATION_QUEUE_WITHOUT_APPROVED_ACTION");
  }
  if (result.blockedReasons.includes("AUTO_COMPLETION_OR_REVIEW_BYPASS_RISK")) {
    throw new ValidationError("NO_AUTO_OPERATION_COMPLETION_IN_PRODUCTION");
  }
  if (result.blockedReasons.includes("UNREVIEWED_EVIDENCE_DOWNSTREAM_RISK")) {
    throw new ValidationError("NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION");
  }
  if (result.blockedReasons.includes("AUTO_FILING_OR_SUBMISSION_RISK")) {
    throw new ForbiddenError("NO_AUTO_FILING_OR_AUTO_SUBMISSION_IN_PRODUCTION");
  }
  if (result.blockedReasons.includes("CLIENT_INTERNAL_STRATEGY_VISIBILITY_RISK")) {
    throw new ForbiddenError("NO_CLIENT_VISIBLE_INTERNAL_STRATEGY_DURING_SMOKE");
  }
  if (result.blockedReasons.includes("ACTION_SMOKE_AUDIT_EVIDENCE_REQUIRED")) {
    throw new ValidationError("NO_ACTION_SMOKE_WITHOUT_AUDIT_EVIDENCE");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "PRODUCTION_ACTION_SMOKE_GATE_BLOCKED");
  }

  return result;
}
