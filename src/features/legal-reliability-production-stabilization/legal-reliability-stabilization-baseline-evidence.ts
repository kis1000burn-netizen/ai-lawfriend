/**
 * Product Phase 54-A — Production Stabilization Monitoring Baseline evidence builder SSOT.
 */
import { evaluateStabilizationBaselineGate } from "./legal-reliability-stabilization-baseline.policy";
import {
  STABILIZATION_BASELINE_DEFAULT_ROLLBACK_RUNBOOK_REF,
} from "./legal-reliability-stabilization-baseline.schema";

export const LEGAL_RELIABILITY_STABILIZATION_BASELINE_EVIDENCE_MARKER =
  "phase54a-legal-reliability-stabilization-baseline-evidence" as const;

type MetricBand = {
  normal: number;
  warning: number;
  critical: number;
  unit: string;
};

function hasMetricBand(band: MetricBand) {
  return (
    Number.isFinite(band.normal) &&
    Number.isFinite(band.warning) &&
    Number.isFinite(band.critical) &&
    band.unit.length > 0
  );
}

function allMetricBandsReady(groups: Record<string, MetricBand>) {
  return Object.values(groups).every(hasMetricBand);
}

export function buildStabilizationBaselineEvidence(input: {
  phase53fCompleteLocked: boolean;
  phase53fEvidenceRef: string;
  productionGoLiveControlRcVerifyPassed: boolean;

  windowId: string;
  startedAt: string;
  endedAt: string;
  durationHours: number;
  productionTenantRef: string;
  sampleSize: number;

  errorRate: {
    actionLoopApiErrorRate: MetricBand;
    actionOperationsApiErrorRate: MetricBand;
    dashboardErrorRate: MetricBand;
    clientPortalErrorRate: MetricBand;
  };

  latency: {
    lawyerWorkbenchP95Ms: MetricBand;
    actionOperationsQueueP95Ms: MetricBand;
    clientPortalP95Ms: MetricBand;
    actionCandidateCreateP95Ms: MetricBand;
  };

  actionLoop: {
    candidateCreationSuccessRate: MetricBand;
    lawyerApprovalToDraftSuccessRate: MetricBand;
    decisionLedgerWriteSuccessRate: MetricBand;
    supplementRequestDraftOnlyRate: MetricBand;
  };

  operationsQueue: {
    openQueueBacklogCount: MetricBand;
    overdueActionCount: MetricBand;
    assignmentMissingCount: MetricBand;
    slaWarningCount: MetricBand;
  };

  auditCoverage: {
    actionCandidateAuditCoverageRate: MetricBand;
    lawyerDecisionAuditCoverageRate: MetricBand;
    operationQueueAuditCoverageRate: MetricBand;
    deniedAccessAuditCoverageRate: MetricBand;
    featureFlagAuditCoverageRate: MetricBand;
  };

  clientInternalAccessDeniedObserved: boolean;
  clientInternalAccessAllowedObserved: boolean;
  staffAdminEscalationDeniedObserved: boolean;
  lawyerReviewBypassDeniedObserved: boolean;
  deniedAccessAuditRefs: string[];

  actionLoopCanDisable: boolean;
  actionOperationsCanDisable: boolean;
  dashboardCanDisable: boolean;
  writeCanDisable: boolean;
  completionCanDisable: boolean;
  readOnlyDegradeCanActivate: boolean;
  rollbackRunbookRef?: string;

  monitoringDashboardRef: string;
  auditLogQueryRef: string;
  operationsQueueSnapshotRef: string;
  roleDenialSnapshotRef: string;
  featureFlagSnapshotRef: string;

  operatorSignedOff: boolean;
  signedOffByUserId?: string;
  signedOffAt?: string;
  signoffNote?: string;
}) {
  const errorRateThresholdsReady = allMetricBandsReady(input.errorRate);
  const latencyThresholdsReady = allMetricBandsReady(input.latency);
  const actionLoopSuccessThresholdsReady = allMetricBandsReady(input.actionLoop);
  const operationsQueueBacklogThresholdsReady = allMetricBandsReady(input.operationsQueue);
  const auditLogCoverageThresholdsReady = allMetricBandsReady(input.auditCoverage);

  const gate = evaluateStabilizationBaselineGate({
    phase53fCompleteLocked: input.phase53fCompleteLocked,
    productionGoLiveControlRcVerifyPassed: input.productionGoLiveControlRcVerifyPassed,

    errorRateThresholdsReady,
    latencyThresholdsReady,
    actionLoopSuccessThresholdsReady,
    operationsQueueBacklogThresholdsReady,
    auditLogCoverageThresholdsReady,

    clientInternalAccessDeniedObserved: input.clientInternalAccessDeniedObserved,
    clientInternalAccessAllowedObserved: input.clientInternalAccessAllowedObserved,
    staffAdminEscalationDeniedObserved: input.staffAdminEscalationDeniedObserved,
    lawyerReviewBypassDeniedObserved: input.lawyerReviewBypassDeniedObserved,
    deniedAccessAuditRefsPresent: input.deniedAccessAuditRefs.length > 0,

    actionLoopCanDisable: input.actionLoopCanDisable,
    actionOperationsCanDisable: input.actionOperationsCanDisable,
    dashboardCanDisable: input.dashboardCanDisable,
    writeCanDisable: input.writeCanDisable,
    completionCanDisable: input.completionCanDisable,
    readOnlyDegradeCanActivate: input.readOnlyDegradeCanActivate,
    rollbackRunbookPresent: Boolean(input.rollbackRunbookRef ?? STABILIZATION_BASELINE_DEFAULT_ROLLBACK_RUNBOOK_REF),

    monitoringDashboardRefPresent: Boolean(input.monitoringDashboardRef),
    auditLogQueryRefPresent: Boolean(input.auditLogQueryRef),
    operationsQueueSnapshotRefPresent: Boolean(input.operationsQueueSnapshotRef),
    roleDenialSnapshotRefPresent: Boolean(input.roleDenialSnapshotRef),
    featureFlagSnapshotRefPresent: Boolean(input.featureFlagSnapshotRef),

    operatorSignedOff: input.operatorSignedOff,
  });

  return {
    phase: "54-A" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    dependency: {
      phase53fCompleteLocked: input.phase53fCompleteLocked,
      phase53fEvidenceRef: input.phase53fEvidenceRef,
      productionGoLiveControlRcVerifyPassed: input.productionGoLiveControlRcVerifyPassed,
    },

    baselineWindow: {
      windowId: input.windowId,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      durationHours: input.durationHours,
      productionTenantRef: input.productionTenantRef,
      sampleSize: input.sampleSize,
    },

    thresholds: {
      errorRate: input.errorRate,
      latency: input.latency,
      actionLoop: input.actionLoop,
      operationsQueue: input.operationsQueue,
      auditCoverage: input.auditCoverage,
    },

    roleDenialPattern: {
      clientInternalAccessDeniedObserved: input.clientInternalAccessDeniedObserved,
      clientInternalAccessAllowedObserved: input.clientInternalAccessAllowedObserved,
      staffAdminEscalationDeniedObserved: input.staffAdminEscalationDeniedObserved,
      lawyerReviewBypassDeniedObserved: input.lawyerReviewBypassDeniedObserved,
      deniedAccessAuditRefs: input.deniedAccessAuditRefs,
    },

    degradeReadiness: {
      actionLoopCanDisable: input.actionLoopCanDisable,
      actionOperationsCanDisable: input.actionOperationsCanDisable,
      dashboardCanDisable: input.dashboardCanDisable,
      writeCanDisable: input.writeCanDisable,
      completionCanDisable: input.completionCanDisable,
      readOnlyDegradeCanActivate: input.readOnlyDegradeCanActivate,
      rollbackRunbookRef: input.rollbackRunbookRef ?? STABILIZATION_BASELINE_DEFAULT_ROLLBACK_RUNBOOK_REF,
    },

    observedBaselineRefs: {
      monitoringDashboardRef: input.monitoringDashboardRef,
      auditLogQueryRef: input.auditLogQueryRef,
      operationsQueueSnapshotRef: input.operationsQueueSnapshotRef,
      roleDenialSnapshotRef: input.roleDenialSnapshotRef,
      featureFlagSnapshotRef: input.featureFlagSnapshotRef,
    },

    operatorSignoff: {
      signedOff: input.operatorSignedOff,
      signedOffByUserId: input.signedOffByUserId,
      signedOffAt: input.signedOffAt,
      signoffNote: input.signoffNote,
    },

    baselineGate: gate,
  };
}
