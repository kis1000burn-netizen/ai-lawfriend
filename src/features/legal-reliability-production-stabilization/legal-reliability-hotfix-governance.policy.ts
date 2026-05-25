/**
 * Product Phase 54-C — Hotfix / Emergency Patch Governance policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_POLICY_MARKER =
  "phase54c-legal-reliability-hotfix-governance-policy" as const;

export const PHASE_54C_BOUNDARY_MARKERS = [
  "NO_HOTFIX_WITHOUT_54B_INCIDENT_SEVERITY",
  "NO_HOTFIX_WITHOUT_SEVERITY_CLASSIFICATION",
  "NO_HOTFIX_WITHOUT_APPROVAL_CHAIN",
  "NO_HOTFIX_WITHOUT_SCOPE_LIMIT",
  "NO_HOTFIX_WITHOUT_ROLLBACK_PLAN",
  "NO_HOTFIX_WITHOUT_POST_PATCH_VERIFY",
  "NO_HOTFIX_WITHOUT_CUSTOMER_IMPACT_RECORD",
  "NO_EMERGENCY_PATCH_WITHOUT_AUDIT_LOG",
  "NO_MIGRATION_HOTFIX_WITHOUT_EXTRA_APPROVAL",
  "NO_HOTFIX_WITHOUT_CLOSEOUT_REVIEW",
] as const;

export function resolveAllowedHotfixTypeBySeverity(severity: string) {
  switch (severity) {
    case "SEV_0":
      return ["EMERGENCY_PATCH", "HOTFIX", "ROLLBACK_ONLY"];
    case "SEV_1":
      return ["EMERGENCY_PATCH", "HOTFIX", "ROLLBACK_ONLY"];
    case "SEV_2":
      return ["HOTFIX", "CONFIG_ONLY", "ROLLBACK_ONLY"];
    case "SEV_3":
      return ["HOTFIX", "STANDARD_PATCH", "CONFIG_ONLY"];
    case "SEV_4":
      return ["STANDARD_PATCH", "CONFIG_ONLY"];
    default:
      return [];
  }
}

export function evaluateHotfixGovernanceGate(input: {
  phase54bIncidentSeverityLocked: boolean;

  severityClassified: boolean;
  severity: "SEV_0" | "SEV_1" | "SEV_2" | "SEV_3" | "SEV_4";
  hotfixType:
    | "EMERGENCY_PATCH"
    | "HOTFIX"
    | "STANDARD_PATCH"
    | "CONFIG_ONLY"
    | "ROLLBACK_ONLY";

  approvalPresent: boolean;
  rollbackOwnerAcknowledged: boolean;

  scopeLimited: boolean;
  affectedTenantsPresent: boolean;
  affectedFeaturesPresent: boolean;

  includesDatabaseMigration: boolean;
  extraMigrationApprovalPresent: boolean;

  rollbackPlanReady: boolean;
  rollbackRunbookPresent: boolean;
  rollbackOwnerAvailable: boolean;

  prePatchVerifyPassed: boolean;
  postPatchVerifyPassed: boolean;
  rollbackVerifyPassed: boolean;
  productionSmokeRequired: boolean;
  productionSmokePassed: boolean;

  customerImpactRecorded: boolean;
  customerCommunicationRequired: boolean;
  customerCommunicationRefPresent: boolean;

  auditLogRequired: boolean;
  auditLogWritten: boolean;
  auditEvidencePresent: boolean;

  closeoutReviewCompleted: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase54bIncidentSeverityLocked) {
    blockedReasons.push("PHASE_54B_INCIDENT_SEVERITY_REQUIRED");
  }

  if (!input.severityClassified) {
    blockedReasons.push("SEVERITY_CLASSIFICATION_REQUIRED");
  }

  const allowedTypes = resolveAllowedHotfixTypeBySeverity(input.severity);
  if (!allowedTypes.includes(input.hotfixType)) {
    blockedReasons.push("HOTFIX_TYPE_NOT_ALLOWED_FOR_SEVERITY");
  }

  if (!input.approvalPresent || !input.rollbackOwnerAcknowledged) {
    blockedReasons.push("HOTFIX_APPROVAL_CHAIN_REQUIRED");
  }

  if (
    !input.scopeLimited ||
    !input.affectedTenantsPresent ||
    !input.affectedFeaturesPresent
  ) {
    blockedReasons.push("HOTFIX_SCOPE_LIMIT_REQUIRED");
  }

  if (input.includesDatabaseMigration && !input.extraMigrationApprovalPresent) {
    blockedReasons.push("MIGRATION_HOTFIX_EXTRA_APPROVAL_REQUIRED");
  }

  if (
    !input.rollbackPlanReady ||
    !input.rollbackRunbookPresent ||
    !input.rollbackOwnerAvailable
  ) {
    blockedReasons.push("HOTFIX_ROLLBACK_PLAN_REQUIRED");
  }

  if (
    !input.prePatchVerifyPassed ||
    !input.postPatchVerifyPassed ||
    !input.rollbackVerifyPassed
  ) {
    blockedReasons.push("HOTFIX_VERIFY_REQUIRED");
  }

  if (input.productionSmokeRequired && !input.productionSmokePassed) {
    blockedReasons.push("PRODUCTION_SMOKE_REQUIRED_FOR_HOTFIX");
  }

  if (!input.customerImpactRecorded) {
    blockedReasons.push("CUSTOMER_IMPACT_RECORD_REQUIRED");
  }

  if (
    input.customerCommunicationRequired &&
    !input.customerCommunicationRefPresent
  ) {
    blockedReasons.push("CUSTOMER_COMMUNICATION_REF_REQUIRED");
  }

  if (
    input.auditLogRequired &&
    (!input.auditLogWritten || !input.auditEvidencePresent)
  ) {
    blockedReasons.push("HOTFIX_AUDIT_LOG_REQUIRED");
  }

  if (!input.closeoutReviewCompleted) {
    blockedReasons.push("HOTFIX_CLOSEOUT_REVIEW_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE_54C_BOUNDARY_MARKERS,
  };
}

export function assertHotfixGovernanceAllowed(
  result: ReturnType<typeof evaluateHotfixGovernanceGate>,
) {
  if (result.blockedReasons.includes("PHASE_54B_INCIDENT_SEVERITY_REQUIRED")) {
    throw new ValidationError("NO_HOTFIX_WITHOUT_54B_INCIDENT_SEVERITY");
  }
  if (result.blockedReasons.includes("SEVERITY_CLASSIFICATION_REQUIRED")) {
    throw new ValidationError("NO_HOTFIX_WITHOUT_SEVERITY_CLASSIFICATION");
  }
  if (result.blockedReasons.includes("HOTFIX_TYPE_NOT_ALLOWED_FOR_SEVERITY")) {
    throw new ValidationError("HOTFIX_TYPE_NOT_ALLOWED_FOR_SEVERITY");
  }
  if (result.blockedReasons.includes("HOTFIX_APPROVAL_CHAIN_REQUIRED")) {
    throw new ValidationError("NO_HOTFIX_WITHOUT_APPROVAL_CHAIN");
  }
  if (result.blockedReasons.includes("HOTFIX_SCOPE_LIMIT_REQUIRED")) {
    throw new ValidationError("NO_HOTFIX_WITHOUT_SCOPE_LIMIT");
  }
  if (result.blockedReasons.includes("MIGRATION_HOTFIX_EXTRA_APPROVAL_REQUIRED")) {
    throw new ForbiddenError("NO_MIGRATION_HOTFIX_WITHOUT_EXTRA_APPROVAL");
  }
  if (result.blockedReasons.includes("HOTFIX_ROLLBACK_PLAN_REQUIRED")) {
    throw new ValidationError("NO_HOTFIX_WITHOUT_ROLLBACK_PLAN");
  }
  if (result.blockedReasons.includes("HOTFIX_VERIFY_REQUIRED")) {
    throw new ValidationError("NO_HOTFIX_WITHOUT_POST_PATCH_VERIFY");
  }
  if (result.blockedReasons.includes("CUSTOMER_IMPACT_RECORD_REQUIRED")) {
    throw new ValidationError("NO_HOTFIX_WITHOUT_CUSTOMER_IMPACT_RECORD");
  }
  if (result.blockedReasons.includes("HOTFIX_AUDIT_LOG_REQUIRED")) {
    throw new ValidationError("NO_EMERGENCY_PATCH_WITHOUT_AUDIT_LOG");
  }
  if (result.blockedReasons.includes("HOTFIX_CLOSEOUT_REVIEW_REQUIRED")) {
    throw new ValidationError("NO_HOTFIX_WITHOUT_CLOSEOUT_REVIEW");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "HOTFIX_GOVERNANCE_BLOCKED");
  }

  return result;
}
