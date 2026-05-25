/**
 * Product Phase 53-A — Production Go-Live Approval Gate policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_GO_LIVE_APPROVAL_POLICY_MARKER =
  "phase53a-legal-reliability-go-live-approval-policy" as const;

export const PHASE_53A_BOUNDARY_MARKERS = [
  "NO_PRODUCTION_GO_LIVE_WITHOUT_STAGING_EVIDENCE",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_APPROVER_LEDGER",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_ROLLBACK_OWNER",
  "NO_PRODUCTION_GO_LIVE_WITH_FAILED_PREDEPLOY_RC",
  "NO_PRODUCTION_GO_LIVE_WITH_PENDING_MIGRATION_RISK",
  "NO_PRODUCTION_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS",
  "NO_PRODUCTION_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING",
  "NO_PRODUCTION_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_FEATURE_FLAG_KILL_SWITCH",
] as const;

export function evaluateProductionGoLiveApprovalGate(input: {
  phase52RcPassed: boolean;
  stagingEvidenceChecklistSigned: boolean;
  productionReadinessRcPassed: boolean;
  stagingLiveValidationRcPassed: boolean;
  predeployCheckPassed: boolean;
  prismaMigrationStatusClean: boolean;
  schemaDriftDetected: boolean;
  roleSmokePassed: boolean;
  clientInternalAccessBlocked: boolean;
  featureFlagKillSwitchVerified: boolean;
  rollbackRunbookReady: boolean;
  rollbackOwnerAcknowledged: boolean;
  approverLedgerPresent: boolean;
  autoCompletionDisabled: boolean;
  autoFilingDisabled: boolean;
  unreviewedEvidenceDownstreamBlocked: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase52RcPassed || !input.stagingEvidenceChecklistSigned) {
    blockedReasons.push("STAGING_EVIDENCE_REQUIRED");
  }

  if (!input.productionReadinessRcPassed || !input.stagingLiveValidationRcPassed) {
    blockedReasons.push("REQUIRED_RC_NOT_PASSED");
  }

  if (!input.predeployCheckPassed) {
    blockedReasons.push("PREDEPLOY_CHECK_NOT_PASSED");
  }

  if (!input.prismaMigrationStatusClean || input.schemaDriftDetected) {
    blockedReasons.push("MIGRATION_OR_SCHEMA_DRIFT_RISK");
  }

  if (!input.roleSmokePassed || !input.clientInternalAccessBlocked) {
    blockedReasons.push("ROLE_BOUNDARY_NOT_VERIFIED");
  }

  if (!input.featureFlagKillSwitchVerified) {
    blockedReasons.push("FEATURE_FLAG_KILL_SWITCH_NOT_VERIFIED");
  }

  if (!input.rollbackRunbookReady || !input.rollbackOwnerAcknowledged) {
    blockedReasons.push("ROLLBACK_READINESS_REQUIRED");
  }

  if (!input.approverLedgerPresent) {
    blockedReasons.push("APPROVER_LEDGER_REQUIRED");
  }

  if (!input.autoCompletionDisabled || !input.autoFilingDisabled) {
    blockedReasons.push("AUTO_COMPLETION_OR_AUTO_FILING_RISK");
  }

  if (!input.unreviewedEvidenceDownstreamBlocked) {
    blockedReasons.push("UNREVIEWED_EVIDENCE_DOWNSTREAM_RISK");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: [...PHASE_53A_BOUNDARY_MARKERS],
  };
}

export function assertProductionGoLiveApprovalAllowed(input: Parameters<
  typeof evaluateProductionGoLiveApprovalGate
>[0]) {
  const result = evaluateProductionGoLiveApprovalGate(input);

  if (result.blockedReasons.includes("STAGING_EVIDENCE_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_WITHOUT_STAGING_EVIDENCE");
  }
  if (result.blockedReasons.includes("APPROVER_LEDGER_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_WITHOUT_APPROVER_LEDGER");
  }
  if (result.blockedReasons.includes("ROLLBACK_READINESS_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_WITHOUT_ROLLBACK_OWNER");
  }
  if (result.blockedReasons.includes("PREDEPLOY_CHECK_NOT_PASSED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_WITH_FAILED_PREDEPLOY_RC");
  }
  if (result.blockedReasons.includes("MIGRATION_OR_SCHEMA_DRIFT_RISK")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_WITH_PENDING_MIGRATION_RISK");
  }
  if (result.blockedReasons.includes("ROLE_BOUNDARY_NOT_VERIFIED")) {
    throw new ForbiddenError("NO_PRODUCTION_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS");
  }
  if (result.blockedReasons.includes("AUTO_COMPLETION_OR_AUTO_FILING_RISK")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING");
  }
  if (result.blockedReasons.includes("UNREVIEWED_EVIDENCE_DOWNSTREAM_RISK")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM");
  }
  if (result.blockedReasons.includes("FEATURE_FLAG_KILL_SWITCH_NOT_VERIFIED")) {
    throw new ValidationError("NO_PRODUCTION_GO_LIVE_WITHOUT_FEATURE_FLAG_KILL_SWITCH");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "GO_LIVE_APPROVAL_BLOCKED");
  }

  return result;
}
