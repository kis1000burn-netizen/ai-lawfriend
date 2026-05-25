/**
 * Product Phase 54-A — Production Stabilization Monitoring Baseline schema SSOT.
 */
import { z } from "zod";

export const stabilizationBaselineStatusSchema = z.enum([
  "NOT_STARTED",
  "MEASURING",
  "READY_FOR_SIGNOFF",
  "BLOCKED",
  "LOCKED",
]);

export const stabilizationBaselineBoundarySchema = z.enum([
  "NO_BASELINE_WITHOUT_PHASE53_COMPLETE_LOCK",
  "NO_BASELINE_WITHOUT_ERROR_RATE_THRESHOLD",
  "NO_BASELINE_WITHOUT_LATENCY_THRESHOLD",
  "NO_BASELINE_WITHOUT_ACTION_LOOP_SUCCESS_THRESHOLD",
  "NO_BASELINE_WITHOUT_OPERATIONS_QUEUE_BACKLOG_THRESHOLD",
  "NO_BASELINE_WITHOUT_AUDIT_LOG_COVERAGE_THRESHOLD",
  "NO_BASELINE_WITHOUT_ROLE_DENIAL_PATTERN",
  "NO_BASELINE_WITHOUT_DEGRADE_READINESS_SIGNAL",
  "NO_BASELINE_WITHOUT_OPERATOR_BASELINE_SIGNOFF",
]);

export const stabilizationMetricBandSchema = z.object({
  normal: z.number(),
  warning: z.number(),
  critical: z.number(),
  unit: z.string().min(1),
});

export const stabilizationBaselineWindowSchema = z.object({
  windowId: z.string().min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  durationHours: z.number().positive(),
  productionTenantRef: z.string().min(1),
  sampleSize: z.number().int().nonnegative(),
});

export const stabilizationErrorRateBaselineSchema = z.object({
  actionLoopApiErrorRate: stabilizationMetricBandSchema,
  actionOperationsApiErrorRate: stabilizationMetricBandSchema,
  dashboardErrorRate: stabilizationMetricBandSchema,
  clientPortalErrorRate: stabilizationMetricBandSchema,
});

export const stabilizationLatencyBaselineSchema = z.object({
  lawyerWorkbenchP95Ms: stabilizationMetricBandSchema,
  actionOperationsQueueP95Ms: stabilizationMetricBandSchema,
  clientPortalP95Ms: stabilizationMetricBandSchema,
  actionCandidateCreateP95Ms: stabilizationMetricBandSchema,
});

export const stabilizationActionLoopBaselineSchema = z.object({
  candidateCreationSuccessRate: stabilizationMetricBandSchema,
  lawyerApprovalToDraftSuccessRate: stabilizationMetricBandSchema,
  decisionLedgerWriteSuccessRate: stabilizationMetricBandSchema,
  supplementRequestDraftOnlyRate: stabilizationMetricBandSchema,
});

export const stabilizationOperationsQueueBaselineSchema = z.object({
  openQueueBacklogCount: stabilizationMetricBandSchema,
  overdueActionCount: stabilizationMetricBandSchema,
  assignmentMissingCount: stabilizationMetricBandSchema,
  slaWarningCount: stabilizationMetricBandSchema,
});

export const stabilizationAuditCoverageBaselineSchema = z.object({
  actionCandidateAuditCoverageRate: stabilizationMetricBandSchema,
  lawyerDecisionAuditCoverageRate: stabilizationMetricBandSchema,
  operationQueueAuditCoverageRate: stabilizationMetricBandSchema,
  deniedAccessAuditCoverageRate: stabilizationMetricBandSchema,
  featureFlagAuditCoverageRate: stabilizationMetricBandSchema,
});

export const stabilizationRoleDenialPatternSchema = z.object({
  clientInternalAccessDeniedObserved: z.boolean(),
  clientInternalAccessAllowedObserved: z.boolean(),
  staffAdminEscalationDeniedObserved: z.boolean(),
  lawyerReviewBypassDeniedObserved: z.boolean(),
  deniedAccessAuditRefs: z.array(z.string()).min(1),
});

export const stabilizationDegradeReadinessSignalSchema = z.object({
  actionLoopCanDisable: z.boolean(),
  actionOperationsCanDisable: z.boolean(),
  dashboardCanDisable: z.boolean(),
  writeCanDisable: z.boolean(),
  completionCanDisable: z.boolean(),
  readOnlyDegradeCanActivate: z.boolean(),
  rollbackRunbookRef: z.string().min(1),
});

export const stabilizationBaselineEvidenceSchema = z.object({
  phase: z.literal("54-A"),
  status: stabilizationBaselineStatusSchema,

  dependency: z.object({
    phase53fCompleteLocked: z.boolean(),
    phase53fEvidenceRef: z.string().min(1),
    productionGoLiveControlRcVerifyPassed: z.boolean(),
  }),

  baselineWindow: stabilizationBaselineWindowSchema,

  thresholds: z.object({
    errorRate: stabilizationErrorRateBaselineSchema,
    latency: stabilizationLatencyBaselineSchema,
    actionLoop: stabilizationActionLoopBaselineSchema,
    operationsQueue: stabilizationOperationsQueueBaselineSchema,
    auditCoverage: stabilizationAuditCoverageBaselineSchema,
  }),

  roleDenialPattern: stabilizationRoleDenialPatternSchema,

  degradeReadiness: stabilizationDegradeReadinessSignalSchema,

  observedBaselineRefs: z.object({
    monitoringDashboardRef: z.string().min(1),
    auditLogQueryRef: z.string().min(1),
    operationsQueueSnapshotRef: z.string().min(1),
    roleDenialSnapshotRef: z.string().min(1),
    featureFlagSnapshotRef: z.string().min(1),
  }),

  operatorSignoff: z.object({
    signedOff: z.boolean(),
    signedOffByUserId: z.string().min(1).optional(),
    signedOffAt: z.string().datetime().optional(),
    signoffNote: z.string().min(1).optional(),
  }),

  baselineGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(stabilizationBaselineBoundarySchema),
  }),
});

export type StabilizationBaselineEvidence = z.infer<typeof stabilizationBaselineEvidenceSchema>;

export const STABILIZATION_BASELINE_AXES = [
  "error-rate",
  "latency",
  "action-loop-success",
  "operations-queue-backlog",
  "audit-log-coverage",
  "role-denial-pattern",
  "degrade-readiness",
] as const;

export const STABILIZATION_BASELINE_DEFAULT_ROLLBACK_RUNBOOK_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ROLLBACK_READINESS_WINDOW_RUNBOOK.md" as const;
