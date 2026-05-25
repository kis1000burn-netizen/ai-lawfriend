/**
 * Product Phase 54-A — Production Stabilization Monitoring Baseline policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_STABILIZATION_BASELINE_POLICY_MARKER =
  "phase54a-legal-reliability-stabilization-baseline-policy" as const;

export const PHASE_54A_BOUNDARY_MARKERS = [
  "NO_BASELINE_WITHOUT_PHASE53_COMPLETE_LOCK",
  "NO_BASELINE_WITHOUT_ERROR_RATE_THRESHOLD",
  "NO_BASELINE_WITHOUT_LATENCY_THRESHOLD",
  "NO_BASELINE_WITHOUT_ACTION_LOOP_SUCCESS_THRESHOLD",
  "NO_BASELINE_WITHOUT_OPERATIONS_QUEUE_BACKLOG_THRESHOLD",
  "NO_BASELINE_WITHOUT_AUDIT_LOG_COVERAGE_THRESHOLD",
  "NO_BASELINE_WITHOUT_ROLE_DENIAL_PATTERN",
  "NO_BASELINE_WITHOUT_DEGRADE_READINESS_SIGNAL",
  "NO_BASELINE_WITHOUT_OPERATOR_BASELINE_SIGNOFF",
] as const;

export function isThresholdReady(input: {
  normal: number;
  warning: number;
  critical: number;
}) {
  return (
    Number.isFinite(input.normal) &&
    Number.isFinite(input.warning) &&
    Number.isFinite(input.critical)
  );
}

export function evaluateMetricBandOrder(input: {
  normal: number;
  warning: number;
  critical: number;
  higherIsWorse: boolean;
}) {
  if (input.higherIsWorse) {
    return input.normal <= input.warning && input.warning <= input.critical;
  }

  return input.normal >= input.warning && input.warning >= input.critical;
}

export function evaluateStabilizationBaselineGate(input: {
  phase53fCompleteLocked: boolean;
  productionGoLiveControlRcVerifyPassed: boolean;

  errorRateThresholdsReady: boolean;
  latencyThresholdsReady: boolean;
  actionLoopSuccessThresholdsReady: boolean;
  operationsQueueBacklogThresholdsReady: boolean;
  auditLogCoverageThresholdsReady: boolean;

  clientInternalAccessDeniedObserved: boolean;
  clientInternalAccessAllowedObserved: boolean;
  staffAdminEscalationDeniedObserved: boolean;
  lawyerReviewBypassDeniedObserved: boolean;
  deniedAccessAuditRefsPresent: boolean;

  actionLoopCanDisable: boolean;
  actionOperationsCanDisable: boolean;
  dashboardCanDisable: boolean;
  writeCanDisable: boolean;
  completionCanDisable: boolean;
  readOnlyDegradeCanActivate: boolean;
  rollbackRunbookPresent: boolean;

  monitoringDashboardRefPresent: boolean;
  auditLogQueryRefPresent: boolean;
  operationsQueueSnapshotRefPresent: boolean;
  roleDenialSnapshotRefPresent: boolean;
  featureFlagSnapshotRefPresent: boolean;

  operatorSignedOff: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase53fCompleteLocked || !input.productionGoLiveControlRcVerifyPassed) {
    blockedReasons.push("PHASE_53F_COMPLETE_LOCK_REQUIRED");
  }

  if (!input.errorRateThresholdsReady) {
    blockedReasons.push("ERROR_RATE_THRESHOLD_REQUIRED");
  }

  if (!input.latencyThresholdsReady) {
    blockedReasons.push("LATENCY_THRESHOLD_REQUIRED");
  }

  if (!input.actionLoopSuccessThresholdsReady) {
    blockedReasons.push("ACTION_LOOP_SUCCESS_THRESHOLD_REQUIRED");
  }

  if (!input.operationsQueueBacklogThresholdsReady) {
    blockedReasons.push("OPERATIONS_QUEUE_BACKLOG_THRESHOLD_REQUIRED");
  }

  if (!input.auditLogCoverageThresholdsReady) {
    blockedReasons.push("AUDIT_LOG_COVERAGE_THRESHOLD_REQUIRED");
  }

  if (
    !input.clientInternalAccessDeniedObserved ||
    input.clientInternalAccessAllowedObserved ||
    !input.staffAdminEscalationDeniedObserved ||
    !input.lawyerReviewBypassDeniedObserved ||
    !input.deniedAccessAuditRefsPresent
  ) {
    blockedReasons.push("ROLE_DENIAL_PATTERN_REQUIRED");
  }

  if (
    !input.actionLoopCanDisable ||
    !input.actionOperationsCanDisable ||
    !input.dashboardCanDisable ||
    !input.writeCanDisable ||
    !input.completionCanDisable ||
    !input.readOnlyDegradeCanActivate ||
    !input.rollbackRunbookPresent
  ) {
    blockedReasons.push("DEGRADE_READINESS_SIGNAL_REQUIRED");
  }

  if (
    !input.monitoringDashboardRefPresent ||
    !input.auditLogQueryRefPresent ||
    !input.operationsQueueSnapshotRefPresent ||
    !input.roleDenialSnapshotRefPresent ||
    !input.featureFlagSnapshotRefPresent
  ) {
    blockedReasons.push("BASELINE_OBSERVATION_REFS_REQUIRED");
  }

  if (!input.operatorSignedOff) {
    blockedReasons.push("OPERATOR_BASELINE_SIGNOFF_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE_54A_BOUNDARY_MARKERS,
  };
}

export function assertStabilizationBaselineGateAllowed(
  input: Parameters<typeof evaluateStabilizationBaselineGate>[0],
) {
  const result = evaluateStabilizationBaselineGate(input);

  if (result.blockedReasons.includes("PHASE_53F_COMPLETE_LOCK_REQUIRED")) {
    throw new ValidationError("NO_BASELINE_WITHOUT_PHASE53_COMPLETE_LOCK");
  }
  if (result.blockedReasons.includes("ERROR_RATE_THRESHOLD_REQUIRED")) {
    throw new ValidationError("NO_BASELINE_WITHOUT_ERROR_RATE_THRESHOLD");
  }
  if (result.blockedReasons.includes("LATENCY_THRESHOLD_REQUIRED")) {
    throw new ValidationError("NO_BASELINE_WITHOUT_LATENCY_THRESHOLD");
  }
  if (result.blockedReasons.includes("ACTION_LOOP_SUCCESS_THRESHOLD_REQUIRED")) {
    throw new ValidationError("NO_BASELINE_WITHOUT_ACTION_LOOP_SUCCESS_THRESHOLD");
  }
  if (result.blockedReasons.includes("OPERATIONS_QUEUE_BACKLOG_THRESHOLD_REQUIRED")) {
    throw new ValidationError("NO_BASELINE_WITHOUT_OPERATIONS_QUEUE_BACKLOG_THRESHOLD");
  }
  if (result.blockedReasons.includes("AUDIT_LOG_COVERAGE_THRESHOLD_REQUIRED")) {
    throw new ValidationError("NO_BASELINE_WITHOUT_AUDIT_LOG_COVERAGE_THRESHOLD");
  }
  if (result.blockedReasons.includes("ROLE_DENIAL_PATTERN_REQUIRED")) {
    throw new ForbiddenError("NO_BASELINE_WITHOUT_ROLE_DENIAL_PATTERN");
  }
  if (result.blockedReasons.includes("DEGRADE_READINESS_SIGNAL_REQUIRED")) {
    throw new ValidationError("NO_BASELINE_WITHOUT_DEGRADE_READINESS_SIGNAL");
  }
  if (result.blockedReasons.includes("OPERATOR_BASELINE_SIGNOFF_REQUIRED")) {
    throw new ValidationError("NO_BASELINE_WITHOUT_OPERATOR_BASELINE_SIGNOFF");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "STABILIZATION_BASELINE_GATE_BLOCKED");
  }

  return result;
}
