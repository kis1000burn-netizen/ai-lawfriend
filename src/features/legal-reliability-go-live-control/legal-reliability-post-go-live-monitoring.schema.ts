/**
 * Product Phase 53-E — Post-Go-Live Monitoring evidence schema SSOT.
 */
import { z } from "zod";

export const postGoLiveMonitoringStatusSchema = z.enum([
  "NOT_STARTED",
  "RUNNING",
  "STABLE",
  "DEGRADED",
  "ROLLBACK_REQUIRED",
  "FAILED",
  "LOCKED",
]);

export const postGoLiveMonitoringBoundarySchema = z.enum([
  "NO_POST_GO_LIVE_MONITORING_WITHOUT_53A_53B_53C_53D_LOCK",
  "NO_GO_LIVE_CLOSEOUT_WITHOUT_MONITORING_WINDOW",
  "NO_CLOSEOUT_WITH_ACTION_LOOP_ERROR_SPIKE",
  "NO_CLOSEOUT_WITH_ACTION_OPERATIONS_ERROR_SPIKE",
  "NO_CLOSEOUT_WITH_CLIENT_BOUNDARY_VIOLATION",
  "NO_CLOSEOUT_WITH_AUDIT_LOG_GAP",
  "NO_CLOSEOUT_WITH_ROLLBACK_FLAG_UNVERIFIED",
  "NO_CLOSEOUT_WITH_AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL",
  "NO_CLOSEOUT_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL",
  "NO_CLOSEOUT_WITHOUT_OPERATOR_SIGNOFF",
]);

export const postGoLiveMonitoringWindowSchema = z.object({
  windowId: z.string().min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  durationHours: z.number().positive(),
  operatorUserId: z.string().min(1),
  rollbackOwnerUserId: z.string().min(1),
});

export const postGoLiveMonitoringSignalsSchema = z.object({
  actionLoopErrorSpikeDetected: z.boolean(),
  actionOperationsErrorSpikeDetected: z.boolean(),
  clientBoundaryViolationDetected: z.boolean(),
  staffAdminEscalationDetected: z.boolean(),
  lawyerReviewBypassDetected: z.boolean(),
  auditLogGapDetected: z.boolean(),
  autoCompletionSignalDetected: z.boolean(),
  autoFilingSignalDetected: z.boolean(),
  autoSubmissionSignalDetected: z.boolean(),
  unreviewedEvidenceDownstreamSignalDetected: z.boolean(),
});

export const rollbackReadinessSchema = z.object({
  actionLoopFlagCanDisable: z.boolean(),
  actionOperationsFlagCanDisable: z.boolean(),
  dashboardFlagCanDisable: z.boolean(),
  writeFlagCanDisable: z.boolean(),
  completionFlagCanDisable: z.boolean(),
  readOnlyDegradeVerified: z.boolean(),
  rollbackRunbookRef: z.string().min(1),
  rollbackOwnerAvailable: z.boolean(),
});

export const postGoLiveMonitoringEvidenceSchema = z.object({
  phase: z.literal("53-E"),
  status: postGoLiveMonitoringStatusSchema,

  dependency: z.object({
    phase53aLocked: z.boolean(),
    phase53bLocked: z.boolean(),
    phase53cLocked: z.boolean(),
    phase53dLocked: z.boolean(),
    approvalEvidenceRef: z.string().min(1),
    migrationEvidenceRef: z.string().min(1),
    roleSmokeEvidenceRef: z.string().min(1),
    actionSmokeEvidenceRef: z.string().min(1),
  }),

  productionTarget: z.object({
    environment: z.literal("production"),
    appBaseUrlMasked: z.string().min(1),
    productionTenantRef: z.string().min(1),
  }),

  monitoringWindow: postGoLiveMonitoringWindowSchema,

  observedSignals: postGoLiveMonitoringSignalsSchema,

  auditEvidence: z.object({
    actionCandidateAuditPresent: z.boolean(),
    lawyerDecisionAuditPresent: z.boolean(),
    operationQueueAuditPresent: z.boolean(),
    deniedAccessAuditPresent: z.boolean(),
    featureFlagAuditPresent: z.boolean(),
    auditEvidenceRefs: z.array(z.string()).min(1),
  }),

  rollbackReadiness: rollbackReadinessSchema,

  incidentReview: z.object({
    incidentDetected: z.boolean(),
    incidentRefs: z.array(z.string()),
    rcaRequired: z.boolean(),
    rcaCompleted: z.boolean(),
    degradedModeActivated: z.boolean(),
    rollbackExecuted: z.boolean(),
  }),

  operatorCloseout: z.object({
    operatorSignedOff: z.boolean(),
    signedOffByUserId: z.string().min(1).optional(),
    signedOffAt: z.string().datetime().optional(),
    closeoutNote: z.string().min(1).optional(),
  }),

  goLiveGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(postGoLiveMonitoringBoundarySchema),
  }),
});

export type PostGoLiveMonitoringEvidence = z.infer<typeof postGoLiveMonitoringEvidenceSchema>;

export const POST_GO_LIVE_MONITORING_APPROVAL_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md" as const;

export const POST_GO_LIVE_MONITORING_MIGRATION_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST.md" as const;

export const POST_GO_LIVE_MONITORING_ROLE_SMOKE_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_CHECKLIST.md" as const;

export const POST_GO_LIVE_MONITORING_ACTION_SMOKE_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_CHECKLIST.md" as const;

export const POST_GO_LIVE_MONITORING_WINDOW_PHASES = [
  { windowId: "T+0~T+30m", purpose: "critical health, login, role boundary, critical API" },
  { windowId: "T+30m~T+2h", purpose: "Action Loop / Operations error rate and AuditLog" },
  { windowId: "T+2h~T+6h", purpose: "boundary and automation misuse monitoring" },
  { windowId: "T+6h~T+24h", purpose: "stability observation and rollback readiness" },
  { windowId: "T+24h closeout", purpose: "operator sign-off and 53-E LOCKED" },
] as const;

export const POST_GO_LIVE_MONITORING_SIGNALS = {
  actionLoopErrorRate: "below threshold",
  actionOperationsErrorRate: "below threshold",
  clientDeniedAccessLogs: "deny logs present, no allow",
  adminOnlyAccessLogs: "no non-admin access",
  supplementRequestStatus: "none before approval, DRAFT-only after approval",
  operationQueue: "approved action only",
  completionReview: "no bypass",
  autoCompletionSignal: "none",
  autoFilingSubmissionSignal: "none",
  unreviewedEvidenceDownstream: "none",
  auditLogCoverage: "candidate, approval, queue, deny events recorded",
  featureFlags: "ON/OFF/read-only toggle verified",
  rollbackOwner: "available during window",
  incidentLog: "none or RCA recorded",
} as const;
