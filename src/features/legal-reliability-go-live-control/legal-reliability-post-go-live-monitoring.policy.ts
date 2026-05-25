/**
 * Product Phase 53-E — Post-Go-Live Monitoring policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_POLICY_MARKER =
  "phase53e-legal-reliability-post-go-live-monitoring-policy" as const;

export const PHASE_53E_BOUNDARY_MARKERS = [
  "NO_POST_GO_LIVE_MONITORING_WITHOUT_53A_53B_53C_53D_LOCK",
  "NO_GO_LIVE_CLOSEOUT_WITHOUT_MONITORING_WINDOW",
  "NO_CLOSEOUT_WITH_ACTION_LOOP_ERROR_SPIKE",
  "NO_CLOSEOUT_WITH_ACTION_OPERATIONS_ERROR_SPIKE",
  "NO_CLOSEOUT_WITH_CLIENT_BOUNDARY_VIOLATION",
  "NO_CLOSEOUT_WITH_AUDIT_LOG_GAP",
  "NO_CLOSEOUT_WITH_ROLLBACK_FLAG_UNVERIFIED",
  "NO_CLOSEOUT_WITH_AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL",
  "NO_CLOSEOUT_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL",
  "NO_CLOSEOUT_WITHOUT_OPERATOR_SIGNOFF",
] as const;

export function evaluatePostGoLiveMonitoringGate(input: {
  phase53aLocked: boolean;
  phase53bLocked: boolean;
  phase53cLocked: boolean;
  phase53dLocked: boolean;

  monitoringWindowStarted: boolean;
  monitoringWindowCompleted: boolean;

  actionLoopErrorSpikeDetected: boolean;
  actionOperationsErrorSpikeDetected: boolean;
  clientBoundaryViolationDetected: boolean;
  staffAdminEscalationDetected: boolean;
  lawyerReviewBypassDetected: boolean;
  auditLogGapDetected: boolean;
  autoCompletionSignalDetected: boolean;
  autoFilingSignalDetected: boolean;
  autoSubmissionSignalDetected: boolean;
  unreviewedEvidenceDownstreamSignalDetected: boolean;

  actionCandidateAuditPresent: boolean;
  lawyerDecisionAuditPresent: boolean;
  operationQueueAuditPresent: boolean;
  deniedAccessAuditPresent: boolean;
  featureFlagAuditPresent: boolean;

  actionLoopFlagCanDisable: boolean;
  actionOperationsFlagCanDisable: boolean;
  dashboardFlagCanDisable: boolean;
  writeFlagCanDisable: boolean;
  completionFlagCanDisable: boolean;
  readOnlyDegradeVerified: boolean;
  rollbackOwnerAvailable: boolean;

  incidentDetected: boolean;
  rcaRequired: boolean;
  rcaCompleted: boolean;

  operatorSignedOff: boolean;
}) {
  const blockedReasons: string[] = [];

  if (
    !input.phase53aLocked ||
    !input.phase53bLocked ||
    !input.phase53cLocked ||
    !input.phase53dLocked
  ) {
    blockedReasons.push("PHASE_53A_53B_53C_53D_LOCK_REQUIRED");
  }

  if (!input.monitoringWindowStarted || !input.monitoringWindowCompleted) {
    blockedReasons.push("POST_GO_LIVE_MONITORING_WINDOW_REQUIRED");
  }

  if (input.actionLoopErrorSpikeDetected) {
    blockedReasons.push("ACTION_LOOP_ERROR_SPIKE_DETECTED");
  }

  if (input.actionOperationsErrorSpikeDetected) {
    blockedReasons.push("ACTION_OPERATIONS_ERROR_SPIKE_DETECTED");
  }

  if (
    input.clientBoundaryViolationDetected ||
    input.staffAdminEscalationDetected ||
    input.lawyerReviewBypassDetected
  ) {
    blockedReasons.push("ROLE_OR_REVIEW_BOUNDARY_VIOLATION_DETECTED");
  }

  if (
    input.autoCompletionSignalDetected ||
    input.autoFilingSignalDetected ||
    input.autoSubmissionSignalDetected
  ) {
    blockedReasons.push("AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL_DETECTED");
  }

  if (input.unreviewedEvidenceDownstreamSignalDetected) {
    blockedReasons.push("UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL_DETECTED");
  }

  if (
    input.auditLogGapDetected ||
    !input.actionCandidateAuditPresent ||
    !input.lawyerDecisionAuditPresent ||
    !input.operationQueueAuditPresent ||
    !input.deniedAccessAuditPresent ||
    !input.featureFlagAuditPresent
  ) {
    blockedReasons.push("AUDIT_LOG_COVERAGE_GAP_DETECTED");
  }

  if (
    !input.actionLoopFlagCanDisable ||
    !input.actionOperationsFlagCanDisable ||
    !input.dashboardFlagCanDisable ||
    !input.writeFlagCanDisable ||
    !input.completionFlagCanDisable ||
    !input.readOnlyDegradeVerified ||
    !input.rollbackOwnerAvailable
  ) {
    blockedReasons.push("ROLLBACK_OR_READ_ONLY_DEGRADE_NOT_READY");
  }

  if (input.incidentDetected && input.rcaRequired && !input.rcaCompleted) {
    blockedReasons.push("INCIDENT_RCA_REQUIRED_BEFORE_CLOSEOUT");
  }

  if (!input.operatorSignedOff) {
    blockedReasons.push("OPERATOR_SIGNOFF_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: [...PHASE_53E_BOUNDARY_MARKERS],
  };
}

export function assertPostGoLiveMonitoringGateAllowed(
  input: Parameters<typeof evaluatePostGoLiveMonitoringGate>[0],
) {
  const result = evaluatePostGoLiveMonitoringGate(input);

  if (result.blockedReasons.includes("PHASE_53A_53B_53C_53D_LOCK_REQUIRED")) {
    throw new ValidationError("NO_POST_GO_LIVE_MONITORING_WITHOUT_53A_53B_53C_53D_LOCK");
  }
  if (result.blockedReasons.includes("POST_GO_LIVE_MONITORING_WINDOW_REQUIRED")) {
    throw new ValidationError("NO_GO_LIVE_CLOSEOUT_WITHOUT_MONITORING_WINDOW");
  }
  if (result.blockedReasons.includes("ACTION_LOOP_ERROR_SPIKE_DETECTED")) {
    throw new ValidationError("NO_CLOSEOUT_WITH_ACTION_LOOP_ERROR_SPIKE");
  }
  if (result.blockedReasons.includes("ACTION_OPERATIONS_ERROR_SPIKE_DETECTED")) {
    throw new ValidationError("NO_CLOSEOUT_WITH_ACTION_OPERATIONS_ERROR_SPIKE");
  }
  if (result.blockedReasons.includes("ROLE_OR_REVIEW_BOUNDARY_VIOLATION_DETECTED")) {
    if (input.clientBoundaryViolationDetected) {
      throw new ForbiddenError("NO_CLOSEOUT_WITH_CLIENT_BOUNDARY_VIOLATION");
    }
    throw new ForbiddenError("NO_CLOSEOUT_WITH_CLIENT_BOUNDARY_VIOLATION");
  }
  if (result.blockedReasons.includes("AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL_DETECTED")) {
    throw new ValidationError("NO_CLOSEOUT_WITH_AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL");
  }
  if (result.blockedReasons.includes("UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL_DETECTED")) {
    throw new ValidationError("NO_CLOSEOUT_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL");
  }
  if (result.blockedReasons.includes("AUDIT_LOG_COVERAGE_GAP_DETECTED")) {
    throw new ValidationError("NO_CLOSEOUT_WITH_AUDIT_LOG_GAP");
  }
  if (result.blockedReasons.includes("ROLLBACK_OR_READ_ONLY_DEGRADE_NOT_READY")) {
    throw new ValidationError("NO_CLOSEOUT_WITH_ROLLBACK_FLAG_UNVERIFIED");
  }
  if (result.blockedReasons.includes("OPERATOR_SIGNOFF_REQUIRED")) {
    throw new ValidationError("NO_CLOSEOUT_WITHOUT_OPERATOR_SIGNOFF");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "POST_GO_LIVE_MONITORING_GATE_BLOCKED");
  }

  return result;
}
