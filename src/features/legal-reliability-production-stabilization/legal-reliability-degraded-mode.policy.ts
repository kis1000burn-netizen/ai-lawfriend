/**
 * Product Phase 54-D — Customer-safe Rollout Window / Degraded Mode policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_DEGRADED_MODE_POLICY_MARKER =
  "phase54d-legal-reliability-degraded-mode-policy" as const;

export const PHASE_54D_BOUNDARY_MARKERS = [
  "NO_DEGRADED_MODE_WITHOUT_54B_54C_LOCK",
  "NO_DEGRADE_WITHOUT_SEVERITY_TRIGGER",
  "NO_DEGRADE_WITHOUT_OPERATOR_APPROVAL",
  "NO_DEGRADE_WITHOUT_TENANT_OR_FEATURE_SCOPE",
  "NO_DEGRADE_WITHOUT_CLIENT_SAFE_MESSAGE",
  "NO_DEGRADE_WITHOUT_READ_ONLY_FALLBACK",
  "NO_DEGRADE_WITHOUT_WRITE_COMPLETION_DISABLE_CONTROL",
  "NO_DEGRADE_WITHOUT_AUDIT_LOG",
  "NO_DEGRADE_WITHOUT_RECOVERY_CRITERIA",
  "NO_DEGRADE_WITHOUT_EXIT_REVIEW",
] as const;

export function resolveRecommendedDegradedModesBySeverity(
  severity: "SEV_0" | "SEV_1" | "SEV_2" | "SEV_3" | "SEV_4",
) {
  switch (severity) {
    case "SEV_0":
      return ["FULL_SAFE_MODE", "TENANT_ISOLATED", "READ_ONLY"];
    case "SEV_1":
      return [
        "ACTION_LOOP_DISABLED",
        "OPERATIONS_WRITE_DISABLED",
        "COMPLETION_DISABLED",
      ];
    case "SEV_2":
      return ["OPERATIONS_WRITE_DISABLED", "DASHBOARD_READ_ONLY"];
    case "SEV_3":
      return ["DASHBOARD_READ_ONLY", "FEATURE_PARTIAL_DISABLED"];
    case "SEV_4":
      return ["FEATURE_PARTIAL_DISABLED"];
    default:
      return [];
  }
}

export function evaluateDegradedModeGate(input: {
  phase54bIncidentSeverityLocked: boolean;
  phase54cHotfixGovernanceLocked: boolean;

  incidentRefPresent: boolean;
  severityTriggerPresent: boolean;

  operatorApproved: boolean;

  modeTypesPresent: boolean;
  scopeLimited: boolean;
  affectedTenantsPresent: boolean;
  affectedFeaturesPresent: boolean;
  globalDisable: boolean;

  clientSafeMessageRequired: boolean;
  clientSafeMessagePresent: boolean;
  containsInternalStrategy: boolean;
  containsUnsafeIncidentDetails: boolean;

  readOnlyFallbackAvailable: boolean;

  writeDisableControlVerified: boolean;
  completionDisableControlVerified: boolean;

  auditLogRequired: boolean;
  auditLogWritten: boolean;
  auditEvidencePresent: boolean;

  errorRateBackToBaseline: boolean;
  latencyBackToBaseline: boolean;
  roleBoundaryClean: boolean;
  auditLogCoverageRestored: boolean;
  hotfixOrRollbackCompleted: boolean;
  operatorRecoveryApprovalRequired: boolean;

  exitReviewCompleted: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase54bIncidentSeverityLocked || !input.phase54cHotfixGovernanceLocked) {
    blockedReasons.push("PHASE_54B_54C_LOCK_REQUIRED");
  }

  if (!input.incidentRefPresent || !input.severityTriggerPresent) {
    blockedReasons.push("SEVERITY_TRIGGER_REQUIRED");
  }

  if (!input.operatorApproved) {
    blockedReasons.push("OPERATOR_APPROVAL_REQUIRED");
  }

  if (!input.modeTypesPresent) {
    blockedReasons.push("DEGRADED_MODE_TYPE_REQUIRED");
  }

  if (
    !input.scopeLimited ||
    !input.affectedTenantsPresent ||
    !input.affectedFeaturesPresent ||
    input.globalDisable
  ) {
    blockedReasons.push("TENANT_OR_FEATURE_SCOPE_REQUIRED");
  }

  if (input.clientSafeMessageRequired && !input.clientSafeMessagePresent) {
    blockedReasons.push("CLIENT_SAFE_MESSAGE_REQUIRED");
  }

  if (input.containsInternalStrategy || input.containsUnsafeIncidentDetails) {
    blockedReasons.push("CLIENT_MESSAGE_SAFETY_FAILED");
  }

  if (!input.readOnlyFallbackAvailable) {
    blockedReasons.push("READ_ONLY_FALLBACK_REQUIRED");
  }

  if (
    !input.writeDisableControlVerified ||
    !input.completionDisableControlVerified
  ) {
    blockedReasons.push("WRITE_COMPLETION_DISABLE_CONTROL_REQUIRED");
  }

  if (
    input.auditLogRequired &&
    (!input.auditLogWritten || !input.auditEvidencePresent)
  ) {
    blockedReasons.push("DEGRADED_MODE_AUDIT_LOG_REQUIRED");
  }

  if (
    !input.errorRateBackToBaseline ||
    !input.latencyBackToBaseline ||
    !input.roleBoundaryClean ||
    !input.auditLogCoverageRestored ||
    !input.hotfixOrRollbackCompleted ||
    !input.operatorRecoveryApprovalRequired
  ) {
    blockedReasons.push("RECOVERY_CRITERIA_REQUIRED");
  }

  if (!input.exitReviewCompleted) {
    blockedReasons.push("EXIT_REVIEW_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE_54D_BOUNDARY_MARKERS,
  };
}

export function assertDegradedModeAllowed(
  result: ReturnType<typeof evaluateDegradedModeGate>,
) {
  if (result.blockedReasons.includes("PHASE_54B_54C_LOCK_REQUIRED")) {
    throw new ValidationError("NO_DEGRADED_MODE_WITHOUT_54B_54C_LOCK");
  }
  if (result.blockedReasons.includes("SEVERITY_TRIGGER_REQUIRED")) {
    throw new ValidationError("NO_DEGRADE_WITHOUT_SEVERITY_TRIGGER");
  }
  if (result.blockedReasons.includes("OPERATOR_APPROVAL_REQUIRED")) {
    throw new ValidationError("NO_DEGRADE_WITHOUT_OPERATOR_APPROVAL");
  }
  if (result.blockedReasons.includes("TENANT_OR_FEATURE_SCOPE_REQUIRED")) {
    throw new ValidationError("NO_DEGRADE_WITHOUT_TENANT_OR_FEATURE_SCOPE");
  }
  if (result.blockedReasons.includes("CLIENT_SAFE_MESSAGE_REQUIRED")) {
    throw new ValidationError("NO_DEGRADE_WITHOUT_CLIENT_SAFE_MESSAGE");
  }
  if (result.blockedReasons.includes("CLIENT_MESSAGE_SAFETY_FAILED")) {
    throw new ForbiddenError("NO_DEGRADE_WITHOUT_CLIENT_SAFE_MESSAGE");
  }
  if (result.blockedReasons.includes("READ_ONLY_FALLBACK_REQUIRED")) {
    throw new ValidationError("NO_DEGRADE_WITHOUT_READ_ONLY_FALLBACK");
  }
  if (result.blockedReasons.includes("WRITE_COMPLETION_DISABLE_CONTROL_REQUIRED")) {
    throw new ValidationError("NO_DEGRADE_WITHOUT_WRITE_COMPLETION_DISABLE_CONTROL");
  }
  if (result.blockedReasons.includes("DEGRADED_MODE_AUDIT_LOG_REQUIRED")) {
    throw new ValidationError("NO_DEGRADE_WITHOUT_AUDIT_LOG");
  }
  if (result.blockedReasons.includes("RECOVERY_CRITERIA_REQUIRED")) {
    throw new ValidationError("NO_DEGRADE_WITHOUT_RECOVERY_CRITERIA");
  }
  if (result.blockedReasons.includes("EXIT_REVIEW_REQUIRED")) {
    throw new ValidationError("NO_DEGRADE_WITHOUT_EXIT_REVIEW");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "DEGRADED_MODE_GATE_BLOCKED");
  }

  return result;
}
