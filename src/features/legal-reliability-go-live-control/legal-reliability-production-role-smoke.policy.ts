/**
 * Product Phase 53-C — Production Role Smoke policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_POLICY_MARKER =
  "phase53c-legal-reliability-production-role-smoke-policy" as const;

export const PHASE_53C_BOUNDARY_MARKERS = [
  "NO_PRODUCTION_ROLE_SMOKE_WITHOUT_53A_53B_LOCK",
  "NO_GO_LIVE_WITHOUT_PRODUCTION_ROLE_SMOKE",
  "NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY",
  "NO_CLIENT_ACCESS_TO_ACTION_OPERATIONS",
  "NO_CLIENT_ACCESS_TO_GO_LIVE_CONTROL",
  "NO_STAFF_ADMIN_PRIVILEGE_ESCALATION",
  "NO_LAWYER_COMPLETION_WITHOUT_REVIEW_BOUNDARY",
  "NO_ROLE_SMOKE_WITH_SHARED_OR_UNKNOWN_ACCOUNT",
  "NO_GO_LIVE_WITH_FAILED_AUTHZ_AUDIT_LOG",
] as const;

export function evaluateProductionRoleSmokeGate(input: {
  phase53aLocked: boolean;
  phase53bLocked: boolean;

  noSharedAccountUsed: boolean;
  roleIdentityConfirmed: boolean;

  allRoleSmokeChecksPassed: boolean;

  clientInternalLegalReliabilityBlocked: boolean;
  clientActionOperationsBlocked: boolean;
  clientGoLiveControlBlocked: boolean;
  clientInternalStrategyGraphBlocked: boolean;

  staffAdminEscalationBlocked: boolean;
  lawyerUnreviewedCompletionBlocked: boolean;
  adminOnlyGoLiveControlVerified: boolean;

  authzAuditLogged: boolean;
  deniedAccessEvidencePresent: boolean;
  allowedAccessEvidencePresent: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase53aLocked || !input.phase53bLocked) {
    blockedReasons.push("PHASE_53A_53B_LOCK_REQUIRED");
  }

  if (!input.noSharedAccountUsed || !input.roleIdentityConfirmed) {
    blockedReasons.push("DEDICATED_ROLE_TEST_ACCOUNTS_REQUIRED");
  }

  if (!input.allRoleSmokeChecksPassed) {
    blockedReasons.push("PRODUCTION_ROLE_SMOKE_FAILED");
  }

  if (
    !input.clientInternalLegalReliabilityBlocked ||
    !input.clientActionOperationsBlocked ||
    !input.clientGoLiveControlBlocked ||
    !input.clientInternalStrategyGraphBlocked
  ) {
    blockedReasons.push("CLIENT_INTERNAL_ACCESS_BOUNDARY_FAILED");
  }

  if (!input.staffAdminEscalationBlocked) {
    blockedReasons.push("STAFF_ADMIN_PRIVILEGE_ESCALATION_RISK");
  }

  if (!input.lawyerUnreviewedCompletionBlocked) {
    blockedReasons.push("LAWYER_UNREVIEWED_COMPLETION_RISK");
  }

  if (!input.adminOnlyGoLiveControlVerified) {
    blockedReasons.push("ADMIN_ONLY_GO_LIVE_CONTROL_NOT_VERIFIED");
  }

  if (
    !input.authzAuditLogged ||
    !input.deniedAccessEvidencePresent ||
    !input.allowedAccessEvidencePresent
  ) {
    blockedReasons.push("AUTHZ_AUDIT_EVIDENCE_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE_53C_BOUNDARY_MARKERS,
  };
}

export function assertProductionRoleSmokeGateAllowed(
  input: Parameters<typeof evaluateProductionRoleSmokeGate>[0],
) {
  const result = evaluateProductionRoleSmokeGate(input);

  if (result.blockedReasons.includes("PHASE_53A_53B_LOCK_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_ROLE_SMOKE_WITHOUT_53A_53B_LOCK");
  }
  if (result.blockedReasons.includes("DEDICATED_ROLE_TEST_ACCOUNTS_REQUIRED")) {
    throw new ValidationError("NO_ROLE_SMOKE_WITH_SHARED_OR_UNKNOWN_ACCOUNT");
  }
  if (result.blockedReasons.includes("PRODUCTION_ROLE_SMOKE_FAILED")) {
    throw new ValidationError("NO_GO_LIVE_WITHOUT_PRODUCTION_ROLE_SMOKE");
  }
  if (result.blockedReasons.includes("CLIENT_INTERNAL_ACCESS_BOUNDARY_FAILED")) {
    if (!input.clientInternalLegalReliabilityBlocked) {
      throw new ForbiddenError("NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY");
    }
    if (!input.clientActionOperationsBlocked) {
      throw new ForbiddenError("NO_CLIENT_ACCESS_TO_ACTION_OPERATIONS");
    }
    if (!input.clientGoLiveControlBlocked) {
      throw new ForbiddenError("NO_CLIENT_ACCESS_TO_GO_LIVE_CONTROL");
    }
    throw new ForbiddenError("NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY");
  }
  if (result.blockedReasons.includes("STAFF_ADMIN_PRIVILEGE_ESCALATION_RISK")) {
    throw new ForbiddenError("NO_STAFF_ADMIN_PRIVILEGE_ESCALATION");
  }
  if (result.blockedReasons.includes("LAWYER_UNREVIEWED_COMPLETION_RISK")) {
    throw new ValidationError("NO_LAWYER_COMPLETION_WITHOUT_REVIEW_BOUNDARY");
  }
  if (result.blockedReasons.includes("AUTHZ_AUDIT_EVIDENCE_REQUIRED")) {
    throw new ValidationError("NO_GO_LIVE_WITH_FAILED_AUTHZ_AUDIT_LOG");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "PRODUCTION_ROLE_SMOKE_GATE_BLOCKED");
  }

  return result;
}
