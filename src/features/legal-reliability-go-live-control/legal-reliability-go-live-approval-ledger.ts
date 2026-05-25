/**
 * Product Phase 53-A — Production Go-Live Approval ledger SSOT.
 */
import {
  evaluateProductionGoLiveApprovalGate,
} from "./legal-reliability-go-live-approval.policy";
import type {
  LegalReliabilityGoLiveApprovalEvidence,
  LegalReliabilityGoLiveApproverLedger,
} from "./legal-reliability-go-live-approval.schema";
import {
  LEGAL_RELIABILITY_GO_LIVE_STAGING_EVIDENCE_REF,
  LEGAL_RELIABILITY_GO_LIVE_STAGING_RUNBOOK_REF,
} from "./legal-reliability-go-live-approval.schema";

export const LEGAL_RELIABILITY_GO_LIVE_APPROVAL_LEDGER_MARKER =
  "phase53a-legal-reliability-go-live-approval-ledger" as const;

export function isApproverLedgerPresent(
  ledger?: LegalReliabilityGoLiveApproverLedger,
): boolean {
  if (!ledger) return false;
  return (
    ledger.approvedByUserId.length > 0 &&
    ledger.approvalReason.length > 0 &&
    ledger.rollbackOwnerUserId.length > 0 &&
    ledger.rollbackOwnerAcknowledged === true
  );
}

export function buildLegalReliabilityGoLiveApprovalEvidence(input: {
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
  autoCompletionDisabled: boolean;
  autoFilingDisabled: boolean;
  unreviewedEvidenceDownstreamBlocked: boolean;
  lawyerDecisionLedgerRequired: boolean;
  clientVisibleInternalStrategyBlocked: boolean;
  approverLedger?: LegalReliabilityGoLiveApproverLedger;
}): LegalReliabilityGoLiveApprovalEvidence {
  const approverLedgerPresent = isApproverLedgerPresent(input.approverLedger);
  const rollbackOwnerAcknowledged = input.approverLedger?.rollbackOwnerAcknowledged ?? false;

  const goLiveGate = evaluateProductionGoLiveApprovalGate({
    phase52RcPassed: input.phase52RcPassed,
    stagingEvidenceChecklistSigned: input.stagingEvidenceChecklistSigned,
    productionReadinessRcPassed: input.productionReadinessRcPassed,
    stagingLiveValidationRcPassed: input.stagingLiveValidationRcPassed,
    predeployCheckPassed: input.predeployCheckPassed,
    prismaMigrationStatusClean: input.prismaMigrationStatusClean,
    schemaDriftDetected: input.schemaDriftDetected,
    roleSmokePassed: input.roleSmokePassed,
    clientInternalAccessBlocked: input.clientInternalAccessBlocked,
    featureFlagKillSwitchVerified: input.featureFlagKillSwitchVerified,
    rollbackRunbookReady: input.rollbackRunbookReady,
    rollbackOwnerAcknowledged,
    approverLedgerPresent,
    autoCompletionDisabled: input.autoCompletionDisabled,
    autoFilingDisabled: input.autoFilingDisabled,
    unreviewedEvidenceDownstreamBlocked: input.unreviewedEvidenceDownstreamBlocked,
  });

  return {
    phase: "53-A",
    status: goLiveGate.allowed ? "APPROVED" : "BLOCKED",
    stagingEvidence: {
      phase52RcPassed: input.phase52RcPassed,
      stagingEvidenceChecklistSigned: input.stagingEvidenceChecklistSigned,
      stagingEvidenceRef: LEGAL_RELIABILITY_GO_LIVE_STAGING_EVIDENCE_REF,
      stagingRunbookRef: LEGAL_RELIABILITY_GO_LIVE_STAGING_RUNBOOK_REF,
    },
    readinessChecks: {
      productionReadinessRcPassed: input.productionReadinessRcPassed,
      stagingLiveValidationRcPassed: input.stagingLiveValidationRcPassed,
      predeployCheckPassed: input.predeployCheckPassed,
      prismaMigrationStatusClean: input.prismaMigrationStatusClean,
      schemaDriftDetected: input.schemaDriftDetected,
      roleSmokePassed: input.roleSmokePassed,
      clientInternalAccessBlocked: input.clientInternalAccessBlocked,
      featureFlagKillSwitchVerified: input.featureFlagKillSwitchVerified,
      rollbackRunbookReady: input.rollbackRunbookReady,
    },
    legalReliabilitySafetyChecks: {
      autoCompletionDisabled: input.autoCompletionDisabled,
      autoFilingDisabled: input.autoFilingDisabled,
      unreviewedEvidenceDownstreamBlocked: input.unreviewedEvidenceDownstreamBlocked,
      lawyerDecisionLedgerRequired: input.lawyerDecisionLedgerRequired,
      clientVisibleInternalStrategyBlocked: input.clientVisibleInternalStrategyBlocked,
    },
    approverLedger: input.approverLedger,
    goLiveGate,
  };
}
