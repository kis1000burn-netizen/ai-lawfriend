/**
 * Product Phase 53-F — Production Go-Live Control RC policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_POLICY_MARKER =
  "phase53f-legal-reliability-production-go-live-control-rc-policy" as const;

export const PHASE_53F_BOUNDARY_MARKERS = [
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53A_APPROVAL_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53B_MIGRATION_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53C_ROLE_SMOKE_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53D_ACTION_SMOKE_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53E_MONITORING_LOCK",
  "NO_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_RC_WITHOUT_ROLLBACK_READINESS",
  "NO_RC_WITH_CLIENT_BOUNDARY_RISK",
  "NO_RC_WITH_AUTO_COMPLETION_OR_AUTO_FILING_RISK",
  "NO_RC_WITHOUT_MASTER_VERIFY",
] as const;

export function evaluateProductionGoLiveControlRcGate(input: {
  phase53aApprovalLocked: boolean;
  phase53bMigrationLocked: boolean;
  phase53cRoleSmokeLocked: boolean;
  phase53dActionSmokeLocked: boolean;
  phase53eMonitoringLocked: boolean;

  evidenceChainComplete: boolean;

  approvalGateVerifyPassed: boolean;
  productionMigrationVerifyPassed: boolean;
  productionRoleSmokeVerifyPassed: boolean;
  productionActionSmokeVerifyPassed: boolean;
  postGoLiveMonitoringVerifyPassed: boolean;

  clientInternalAccessBlocked: boolean;
  staffAdminEscalationBlocked: boolean;
  lawyerReviewBypassBlocked: boolean;
  autoCompletionBlocked: boolean;
  autoFilingBlocked: boolean;
  autoSubmissionBlocked: boolean;
  unreviewedEvidenceDownstreamBlocked: boolean;
  clientInternalStrategyBlocked: boolean;

  readOnlyDegradeVerified: boolean;
  rollbackFlagVerified: boolean;
  rollbackOwnerAvailable: boolean;

  implementationEvidenceUpdated: boolean;
  navigatorUpdated: boolean;
  deployPrecheckUpdated: boolean;
  operationsIndexUpdated: boolean;
  roadmapUpdated: boolean;
  rcSummaryUpdated: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase53aApprovalLocked) {
    blockedReasons.push("PHASE_53A_APPROVAL_LOCK_REQUIRED");
  }

  if (!input.phase53bMigrationLocked) {
    blockedReasons.push("PHASE_53B_MIGRATION_LOCK_REQUIRED");
  }

  if (!input.phase53cRoleSmokeLocked) {
    blockedReasons.push("PHASE_53C_ROLE_SMOKE_LOCK_REQUIRED");
  }

  if (!input.phase53dActionSmokeLocked) {
    blockedReasons.push("PHASE_53D_ACTION_SMOKE_LOCK_REQUIRED");
  }

  if (!input.phase53eMonitoringLocked) {
    blockedReasons.push("PHASE_53E_MONITORING_LOCK_REQUIRED");
  }

  if (!input.evidenceChainComplete) {
    blockedReasons.push("PRODUCTION_GO_LIVE_EVIDENCE_CHAIN_INCOMPLETE");
  }

  if (
    !input.approvalGateVerifyPassed ||
    !input.productionMigrationVerifyPassed ||
    !input.productionRoleSmokeVerifyPassed ||
    !input.productionActionSmokeVerifyPassed ||
    !input.postGoLiveMonitoringVerifyPassed
  ) {
    blockedReasons.push("PHASE_53_SUB_VERIFY_NOT_PASSED");
  }

  if (
    !input.clientInternalAccessBlocked ||
    !input.staffAdminEscalationBlocked ||
    !input.lawyerReviewBypassBlocked
  ) {
    blockedReasons.push("ROLE_BOUNDARY_RISK_REMAINS");
  }

  if (
    !input.autoCompletionBlocked ||
    !input.autoFilingBlocked ||
    !input.autoSubmissionBlocked
  ) {
    blockedReasons.push("AUTO_COMPLETION_OR_AUTO_FILING_RISK_REMAINS");
  }

  if (!input.unreviewedEvidenceDownstreamBlocked) {
    blockedReasons.push("UNREVIEWED_EVIDENCE_DOWNSTREAM_RISK_REMAINS");
  }

  if (!input.clientInternalStrategyBlocked) {
    blockedReasons.push("CLIENT_INTERNAL_STRATEGY_RISK_REMAINS");
  }

  if (
    !input.readOnlyDegradeVerified ||
    !input.rollbackFlagVerified ||
    !input.rollbackOwnerAvailable
  ) {
    blockedReasons.push("ROLLBACK_READINESS_REQUIRED");
  }

  if (
    !input.implementationEvidenceUpdated ||
    !input.navigatorUpdated ||
    !input.deployPrecheckUpdated ||
    !input.operationsIndexUpdated ||
    !input.roadmapUpdated ||
    !input.rcSummaryUpdated
  ) {
    blockedReasons.push("GOVERNANCE_DOCS_NOT_UPDATED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: [...PHASE_53F_BOUNDARY_MARKERS],
  };
}

export function assertProductionGoLiveControlRcGateAllowed(
  input: Parameters<typeof evaluateProductionGoLiveControlRcGate>[0],
) {
  const result = evaluateProductionGoLiveControlRcGate(input);

  if (result.blockedReasons.includes("PHASE_53A_APPROVAL_LOCK_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53A_APPROVAL_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_53B_MIGRATION_LOCK_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53B_MIGRATION_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_53C_ROLE_SMOKE_LOCK_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53C_ROLE_SMOKE_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_53D_ACTION_SMOKE_LOCK_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53D_ACTION_SMOKE_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_53E_MONITORING_LOCK_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53E_MONITORING_LOCK");
  }
  if (result.blockedReasons.includes("PRODUCTION_GO_LIVE_EVIDENCE_CHAIN_INCOMPLETE")) {
    throw new ValidationError("NO_RC_WITH_BROKEN_EVIDENCE_CHAIN");
  }
  if (result.blockedReasons.includes("PHASE_53_SUB_VERIFY_NOT_PASSED")) {
    throw new ValidationError("NO_RC_WITHOUT_MASTER_VERIFY");
  }
  if (result.blockedReasons.includes("ROLE_BOUNDARY_RISK_REMAINS")) {
    throw new ForbiddenError("NO_RC_WITH_CLIENT_BOUNDARY_RISK");
  }
  if (result.blockedReasons.includes("AUTO_COMPLETION_OR_AUTO_FILING_RISK_REMAINS")) {
    throw new ValidationError("NO_RC_WITH_AUTO_COMPLETION_OR_AUTO_FILING_RISK");
  }
  if (result.blockedReasons.includes("ROLLBACK_READINESS_REQUIRED")) {
    throw new ValidationError("NO_RC_WITHOUT_ROLLBACK_READINESS");
  }
  if (result.blockedReasons.includes("GOVERNANCE_DOCS_NOT_UPDATED")) {
    throw new ValidationError("NO_RC_WITHOUT_MASTER_VERIFY");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "PRODUCTION_GO_LIVE_CONTROL_RC_BLOCKED");
  }

  return result;
}
