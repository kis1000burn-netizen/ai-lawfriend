/**
 * Product Phase 53-F — Production Go-Live Control RC evidence builder SSOT.
 */
import { evaluateProductionGoLiveControlRcGate } from "./legal-reliability-go-live-control-rc.policy";
import {
  LEGAL_RELIABILITY_GO_LIVE_APPROVAL_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_EVIDENCE_TAG,
} from "./legal-reliability-go-live-control-rc-lock";
import {
  PRODUCTION_GO_LIVE_CONTROL_RC_IMPLEMENTATION_EVIDENCE_REF,
  PRODUCTION_GO_LIVE_CONTROL_RC_NAVIGATOR_REF,
} from "./legal-reliability-go-live-control-rc.schema";
import { LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_EVIDENCE_TAG } from "./legal-reliability-post-go-live-monitoring-rc-lock";
import { LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_EVIDENCE_TAG } from "./legal-reliability-production-action-smoke-rc-lock";
import { LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_TAG } from "./legal-reliability-production-migration-rc-lock";
import { LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_EVIDENCE_TAG } from "./legal-reliability-production-role-smoke-rc-lock";
import { POST_GO_LIVE_ROLLBACK_RUNBOOK_REF } from "./legal-reliability-post-go-live-monitoring-evidence";

export const LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_EVIDENCE_MARKER =
  "phase53f-legal-reliability-production-go-live-control-rc-evidence" as const;

export function buildProductionGoLiveControlRcEvidence(input: {
  phase53aApprovalLocked: boolean;
  phase53bMigrationLocked: boolean;
  phase53cRoleSmokeLocked: boolean;
  phase53dActionSmokeLocked: boolean;
  phase53eMonitoringLocked: boolean;

  approvalEvidenceRef?: string;
  migrationEvidenceRef?: string;
  roleSmokeEvidenceRef?: string;
  actionSmokeEvidenceRef?: string;
  monitoringEvidenceRef?: string;
  implementationEvidenceRef?: string;
  navigatorRef?: string;
  chainComplete: boolean;

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
  rollbackRunbookRef?: string;
  rollbackOwnerAvailable: boolean;

  implementationEvidenceUpdated: boolean;
  navigatorUpdated: boolean;
  deployPrecheckUpdated: boolean;
  operationsIndexUpdated: boolean;
  roadmapUpdated: boolean;
  rcSummaryUpdated: boolean;
}) {
  const gate = evaluateProductionGoLiveControlRcGate({
    phase53aApprovalLocked: input.phase53aApprovalLocked,
    phase53bMigrationLocked: input.phase53bMigrationLocked,
    phase53cRoleSmokeLocked: input.phase53cRoleSmokeLocked,
    phase53dActionSmokeLocked: input.phase53dActionSmokeLocked,
    phase53eMonitoringLocked: input.phase53eMonitoringLocked,
    evidenceChainComplete: input.chainComplete,

    approvalGateVerifyPassed: input.approvalGateVerifyPassed,
    productionMigrationVerifyPassed: input.productionMigrationVerifyPassed,
    productionRoleSmokeVerifyPassed: input.productionRoleSmokeVerifyPassed,
    productionActionSmokeVerifyPassed: input.productionActionSmokeVerifyPassed,
    postGoLiveMonitoringVerifyPassed: input.postGoLiveMonitoringVerifyPassed,

    clientInternalAccessBlocked: input.clientInternalAccessBlocked,
    staffAdminEscalationBlocked: input.staffAdminEscalationBlocked,
    lawyerReviewBypassBlocked: input.lawyerReviewBypassBlocked,
    autoCompletionBlocked: input.autoCompletionBlocked,
    autoFilingBlocked: input.autoFilingBlocked,
    autoSubmissionBlocked: input.autoSubmissionBlocked,
    unreviewedEvidenceDownstreamBlocked: input.unreviewedEvidenceDownstreamBlocked,
    clientInternalStrategyBlocked: input.clientInternalStrategyBlocked,

    readOnlyDegradeVerified: input.readOnlyDegradeVerified,
    rollbackFlagVerified: input.rollbackFlagVerified,
    rollbackOwnerAvailable: input.rollbackOwnerAvailable,

    implementationEvidenceUpdated: input.implementationEvidenceUpdated,
    navigatorUpdated: input.navigatorUpdated,
    deployPrecheckUpdated: input.deployPrecheckUpdated,
    operationsIndexUpdated: input.operationsIndexUpdated,
    roadmapUpdated: input.roadmapUpdated,
    rcSummaryUpdated: input.rcSummaryUpdated,
  });

  return {
    phase: "53-F" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    phaseLocks: {
      phase53aApprovalLocked: input.phase53aApprovalLocked,
      phase53bMigrationLocked: input.phase53bMigrationLocked,
      phase53cRoleSmokeLocked: input.phase53cRoleSmokeLocked,
      phase53dActionSmokeLocked: input.phase53dActionSmokeLocked,
      phase53eMonitoringLocked: input.phase53eMonitoringLocked,
    },

    evidenceChain: {
      approvalEvidenceRef: input.approvalEvidenceRef ?? LEGAL_RELIABILITY_GO_LIVE_APPROVAL_EVIDENCE_TAG,
      migrationEvidenceRef:
        input.migrationEvidenceRef ?? LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_TAG,
      roleSmokeEvidenceRef:
        input.roleSmokeEvidenceRef ?? LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_EVIDENCE_TAG,
      actionSmokeEvidenceRef:
        input.actionSmokeEvidenceRef ?? LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_EVIDENCE_TAG,
      monitoringEvidenceRef:
        input.monitoringEvidenceRef ?? LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_EVIDENCE_TAG,
      implementationEvidenceRef:
        input.implementationEvidenceRef ?? PRODUCTION_GO_LIVE_CONTROL_RC_IMPLEMENTATION_EVIDENCE_REF,
      navigatorRef: input.navigatorRef ?? PRODUCTION_GO_LIVE_CONTROL_RC_NAVIGATOR_REF,
      chainComplete: input.chainComplete,
    },

    masterVerify: {
      approvalGateVerifyPassed: input.approvalGateVerifyPassed,
      productionMigrationVerifyPassed: input.productionMigrationVerifyPassed,
      productionRoleSmokeVerifyPassed: input.productionRoleSmokeVerifyPassed,
      productionActionSmokeVerifyPassed: input.productionActionSmokeVerifyPassed,
      postGoLiveMonitoringVerifyPassed: input.postGoLiveMonitoringVerifyPassed,
      productionGoLiveControlRcVerifyPassed: gate.allowed,
    },

    safetyBoundaries: {
      clientInternalAccessBlocked: input.clientInternalAccessBlocked,
      staffAdminEscalationBlocked: input.staffAdminEscalationBlocked,
      lawyerReviewBypassBlocked: input.lawyerReviewBypassBlocked,
      autoCompletionBlocked: input.autoCompletionBlocked,
      autoFilingBlocked: input.autoFilingBlocked,
      autoSubmissionBlocked: input.autoSubmissionBlocked,
      unreviewedEvidenceDownstreamBlocked: input.unreviewedEvidenceDownstreamBlocked,
      clientInternalStrategyBlocked: input.clientInternalStrategyBlocked,
    },

    rollbackReadiness: {
      readOnlyDegradeVerified: input.readOnlyDegradeVerified,
      rollbackFlagVerified: input.rollbackFlagVerified,
      rollbackRunbookRef: input.rollbackRunbookRef ?? POST_GO_LIVE_ROLLBACK_RUNBOOK_REF,
      rollbackOwnerAvailable: input.rollbackOwnerAvailable,
    },

    governanceDocs: {
      implementationEvidenceUpdated: input.implementationEvidenceUpdated,
      navigatorUpdated: input.navigatorUpdated,
      deployPrecheckUpdated: input.deployPrecheckUpdated,
      operationsIndexUpdated: input.operationsIndexUpdated,
      roadmapUpdated: input.roadmapUpdated,
      rcSummaryUpdated: input.rcSummaryUpdated,
    },

    rcGate: gate,
  };
}

export const PRODUCTION_GO_LIVE_CONTROL_RC_EVIDENCE_CHAIN_TAGS = [
  LEGAL_RELIABILITY_GO_LIVE_APPROVAL_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_EVIDENCE_TAG,
  LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_EVIDENCE_TAG,
] as const;
