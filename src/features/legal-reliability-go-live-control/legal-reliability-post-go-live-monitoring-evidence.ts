/**
 * Product Phase 53-E — Post-Go-Live Monitoring evidence builder SSOT.
 */
import { evaluatePostGoLiveMonitoringGate } from "./legal-reliability-post-go-live-monitoring.policy";
import {
  POST_GO_LIVE_MONITORING_ACTION_SMOKE_EVIDENCE_REF,
  POST_GO_LIVE_MONITORING_APPROVAL_EVIDENCE_REF,
  POST_GO_LIVE_MONITORING_MIGRATION_EVIDENCE_REF,
  POST_GO_LIVE_MONITORING_ROLE_SMOKE_EVIDENCE_REF,
} from "./legal-reliability-post-go-live-monitoring.schema";

export const LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_EVIDENCE_MARKER =
  "phase53e-legal-reliability-post-go-live-monitoring-evidence" as const;

export const POST_GO_LIVE_ROLLBACK_RUNBOOK_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ROLLBACK_READINESS_WINDOW_RUNBOOK.md" as const;

export function buildPostGoLiveMonitoringEvidence(input: {
  phase53aLocked: boolean;
  phase53bLocked: boolean;
  phase53cLocked: boolean;
  phase53dLocked: boolean;
  approvalEvidenceRef?: string;
  migrationEvidenceRef?: string;
  roleSmokeEvidenceRef?: string;
  actionSmokeEvidenceRef?: string;

  appBaseUrlMasked: string;
  productionTenantRef: string;

  windowId: string;
  startedAt: string;
  endedAt?: string;
  durationHours: number;
  operatorUserId: string;
  rollbackOwnerUserId: string;

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
  auditEvidenceRefs: string[];

  actionLoopFlagCanDisable: boolean;
  actionOperationsFlagCanDisable: boolean;
  dashboardFlagCanDisable: boolean;
  writeFlagCanDisable: boolean;
  completionFlagCanDisable: boolean;
  readOnlyDegradeVerified: boolean;
  rollbackRunbookRef?: string;
  rollbackOwnerAvailable: boolean;

  incidentDetected: boolean;
  incidentRefs: string[];
  rcaRequired: boolean;
  rcaCompleted: boolean;
  degradedModeActivated: boolean;
  rollbackExecuted: boolean;

  operatorSignedOff: boolean;
  signedOffByUserId?: string;
  signedOffAt?: string;
  closeoutNote?: string;
}) {
  const gate = evaluatePostGoLiveMonitoringGate({
    phase53aLocked: input.phase53aLocked,
    phase53bLocked: input.phase53bLocked,
    phase53cLocked: input.phase53cLocked,
    phase53dLocked: input.phase53dLocked,

    monitoringWindowStarted: Boolean(input.startedAt),
    monitoringWindowCompleted: Boolean(input.endedAt),

    actionLoopErrorSpikeDetected: input.actionLoopErrorSpikeDetected,
    actionOperationsErrorSpikeDetected: input.actionOperationsErrorSpikeDetected,
    clientBoundaryViolationDetected: input.clientBoundaryViolationDetected,
    staffAdminEscalationDetected: input.staffAdminEscalationDetected,
    lawyerReviewBypassDetected: input.lawyerReviewBypassDetected,
    auditLogGapDetected: input.auditLogGapDetected,
    autoCompletionSignalDetected: input.autoCompletionSignalDetected,
    autoFilingSignalDetected: input.autoFilingSignalDetected,
    autoSubmissionSignalDetected: input.autoSubmissionSignalDetected,
    unreviewedEvidenceDownstreamSignalDetected:
      input.unreviewedEvidenceDownstreamSignalDetected,

    actionCandidateAuditPresent: input.actionCandidateAuditPresent,
    lawyerDecisionAuditPresent: input.lawyerDecisionAuditPresent,
    operationQueueAuditPresent: input.operationQueueAuditPresent,
    deniedAccessAuditPresent: input.deniedAccessAuditPresent,
    featureFlagAuditPresent: input.featureFlagAuditPresent,

    actionLoopFlagCanDisable: input.actionLoopFlagCanDisable,
    actionOperationsFlagCanDisable: input.actionOperationsFlagCanDisable,
    dashboardFlagCanDisable: input.dashboardFlagCanDisable,
    writeFlagCanDisable: input.writeFlagCanDisable,
    completionFlagCanDisable: input.completionFlagCanDisable,
    readOnlyDegradeVerified: input.readOnlyDegradeVerified,
    rollbackOwnerAvailable: input.rollbackOwnerAvailable,

    incidentDetected: input.incidentDetected,
    rcaRequired: input.rcaRequired,
    rcaCompleted: input.rcaCompleted,

    operatorSignedOff: input.operatorSignedOff,
  });

  return {
    phase: "53-E" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    dependency: {
      phase53aLocked: input.phase53aLocked,
      phase53bLocked: input.phase53bLocked,
      phase53cLocked: input.phase53cLocked,
      phase53dLocked: input.phase53dLocked,
      approvalEvidenceRef: input.approvalEvidenceRef ?? POST_GO_LIVE_MONITORING_APPROVAL_EVIDENCE_REF,
      migrationEvidenceRef: input.migrationEvidenceRef ?? POST_GO_LIVE_MONITORING_MIGRATION_EVIDENCE_REF,
      roleSmokeEvidenceRef: input.roleSmokeEvidenceRef ?? POST_GO_LIVE_MONITORING_ROLE_SMOKE_EVIDENCE_REF,
      actionSmokeEvidenceRef:
        input.actionSmokeEvidenceRef ?? POST_GO_LIVE_MONITORING_ACTION_SMOKE_EVIDENCE_REF,
    },

    productionTarget: {
      environment: "production" as const,
      appBaseUrlMasked: input.appBaseUrlMasked,
      productionTenantRef: input.productionTenantRef,
    },

    monitoringWindow: {
      windowId: input.windowId,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      durationHours: input.durationHours,
      operatorUserId: input.operatorUserId,
      rollbackOwnerUserId: input.rollbackOwnerUserId,
    },

    observedSignals: {
      actionLoopErrorSpikeDetected: input.actionLoopErrorSpikeDetected,
      actionOperationsErrorSpikeDetected: input.actionOperationsErrorSpikeDetected,
      clientBoundaryViolationDetected: input.clientBoundaryViolationDetected,
      staffAdminEscalationDetected: input.staffAdminEscalationDetected,
      lawyerReviewBypassDetected: input.lawyerReviewBypassDetected,
      auditLogGapDetected: input.auditLogGapDetected,
      autoCompletionSignalDetected: input.autoCompletionSignalDetected,
      autoFilingSignalDetected: input.autoFilingSignalDetected,
      autoSubmissionSignalDetected: input.autoSubmissionSignalDetected,
      unreviewedEvidenceDownstreamSignalDetected:
        input.unreviewedEvidenceDownstreamSignalDetected,
    },

    auditEvidence: {
      actionCandidateAuditPresent: input.actionCandidateAuditPresent,
      lawyerDecisionAuditPresent: input.lawyerDecisionAuditPresent,
      operationQueueAuditPresent: input.operationQueueAuditPresent,
      deniedAccessAuditPresent: input.deniedAccessAuditPresent,
      featureFlagAuditPresent: input.featureFlagAuditPresent,
      auditEvidenceRefs: input.auditEvidenceRefs,
    },

    rollbackReadiness: {
      actionLoopFlagCanDisable: input.actionLoopFlagCanDisable,
      actionOperationsFlagCanDisable: input.actionOperationsFlagCanDisable,
      dashboardFlagCanDisable: input.dashboardFlagCanDisable,
      writeFlagCanDisable: input.writeFlagCanDisable,
      completionFlagCanDisable: input.completionFlagCanDisable,
      readOnlyDegradeVerified: input.readOnlyDegradeVerified,
      rollbackRunbookRef: input.rollbackRunbookRef ?? POST_GO_LIVE_ROLLBACK_RUNBOOK_REF,
      rollbackOwnerAvailable: input.rollbackOwnerAvailable,
    },

    incidentReview: {
      incidentDetected: input.incidentDetected,
      incidentRefs: input.incidentRefs,
      rcaRequired: input.rcaRequired,
      rcaCompleted: input.rcaCompleted,
      degradedModeActivated: input.degradedModeActivated,
      rollbackExecuted: input.rollbackExecuted,
    },

    operatorCloseout: {
      operatorSignedOff: input.operatorSignedOff,
      signedOffByUserId: input.signedOffByUserId,
      signedOffAt: input.signedOffAt,
      closeoutNote: input.closeoutNote,
    },

    goLiveGate: gate,
  };
}
