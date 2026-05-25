/**
 * Product Phase 54-D — Customer-safe Rollout Window / Degraded Mode evidence builder SSOT.
 */
import { evaluateDegradedModeGate } from "./legal-reliability-degraded-mode.policy";

export const LEGAL_RELIABILITY_DEGRADED_MODE_EVIDENCE_MARKER =
  "phase54d-legal-reliability-degraded-mode-evidence" as const;

export function buildDegradedModeEvidence(input: {
  phase54bIncidentSeverityLocked: boolean;
  phase54cHotfixGovernanceLocked: boolean;
  incidentSeverityEvidenceRef: string;
  hotfixGovernanceEvidenceRef: string;

  incidentRef: string;
  severity: "SEV_0" | "SEV_1" | "SEV_2" | "SEV_3" | "SEV_4";
  triggerReason: string;
  triggeredAt: string;

  operatorApproved: boolean;
  approvedByUserId: string;
  approvedAt: string;
  approvalReason: string;

  modeTypes: Array<
    | "READ_ONLY"
    | "ACTION_LOOP_DISABLED"
    | "OPERATIONS_WRITE_DISABLED"
    | "COMPLETION_DISABLED"
    | "DASHBOARD_READ_ONLY"
    | "TENANT_ISOLATED"
    | "FEATURE_PARTIAL_DISABLED"
    | "FULL_SAFE_MODE"
  >;

  scopeLimited: boolean;
  affectedTenants: string[];
  affectedFeatures: string[];
  globalDisable: boolean;
  tenantIsolationApplied: boolean;

  actionLoopEnabled: boolean;
  actionOperationsEnabled: boolean;
  dashboardEnabled: boolean;
  writeEnabled: boolean;
  completionEnabled: boolean;
  clientPortalReadOnly: boolean;
  internalAdminOnlyOverride: boolean;

  clientSafeMessageRequired: boolean;
  clientSafeMessageRef?: string;
  containsInternalStrategy: boolean;
  containsIncidentDetailsBeyondSafeDisclosure: boolean;

  auditLogRequired: boolean;
  auditLogWritten: boolean;
  auditEvidenceRefs: string[];

  errorRateBackToBaseline: boolean;
  latencyBackToBaseline: boolean;
  roleBoundaryClean: boolean;
  auditLogCoverageRestored: boolean;
  hotfixOrRollbackCompleted: boolean;
  operatorRecoveryApprovalRequired: boolean;

  exitReviewCompleted: boolean;
  reviewedByUserId?: string;
  reviewedAt?: string;
  recoveryNote?: string;
}) {
  const gate = evaluateDegradedModeGate({
    phase54bIncidentSeverityLocked: input.phase54bIncidentSeverityLocked,
    phase54cHotfixGovernanceLocked: input.phase54cHotfixGovernanceLocked,

    incidentRefPresent: Boolean(input.incidentRef),
    severityTriggerPresent: Boolean(input.severity),

    operatorApproved: input.operatorApproved,

    modeTypesPresent: input.modeTypes.length > 0,
    scopeLimited: input.scopeLimited,
    affectedTenantsPresent: input.affectedTenants.length > 0,
    affectedFeaturesPresent: input.affectedFeatures.length > 0,
    globalDisable: input.globalDisable,

    clientSafeMessageRequired: input.clientSafeMessageRequired,
    clientSafeMessagePresent: Boolean(input.clientSafeMessageRef),
    containsInternalStrategy: input.containsInternalStrategy,
    containsUnsafeIncidentDetails:
      input.containsIncidentDetailsBeyondSafeDisclosure,

    readOnlyFallbackAvailable: input.clientPortalReadOnly,

    writeDisableControlVerified: input.writeEnabled === false,
    completionDisableControlVerified: input.completionEnabled === false,

    auditLogRequired: input.auditLogRequired,
    auditLogWritten: input.auditLogWritten,
    auditEvidencePresent: input.auditEvidenceRefs.length > 0,

    errorRateBackToBaseline: input.errorRateBackToBaseline,
    latencyBackToBaseline: input.latencyBackToBaseline,
    roleBoundaryClean: input.roleBoundaryClean,
    auditLogCoverageRestored: input.auditLogCoverageRestored,
    hotfixOrRollbackCompleted: input.hotfixOrRollbackCompleted,
    operatorRecoveryApprovalRequired: input.operatorRecoveryApprovalRequired,

    exitReviewCompleted: input.exitReviewCompleted,
  });

  return {
    phase: "54-D" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    dependency: {
      phase54bIncidentSeverityLocked: input.phase54bIncidentSeverityLocked,
      phase54cHotfixGovernanceLocked: input.phase54cHotfixGovernanceLocked,
      incidentSeverityEvidenceRef: input.incidentSeverityEvidenceRef,
      hotfixGovernanceEvidenceRef: input.hotfixGovernanceEvidenceRef,
    },

    trigger: {
      incidentRef: input.incidentRef,
      severity: input.severity,
      triggerReason: input.triggerReason,
      triggeredAt: input.triggeredAt,
    },

    operatorApproval: {
      approved: input.operatorApproved,
      approvedByUserId: input.approvedByUserId,
      approvedAt: input.approvedAt,
      approvalReason: input.approvalReason,
    },

    degradedMode: {
      modeTypes: input.modeTypes,
      scope: {
        scopeLimited: input.scopeLimited,
        affectedTenants: input.affectedTenants,
        affectedFeatures: input.affectedFeatures,
        globalDisable: input.globalDisable,
        tenantIsolationApplied: input.tenantIsolationApplied,
      },
      controlState: {
        actionLoopEnabled: input.actionLoopEnabled,
        actionOperationsEnabled: input.actionOperationsEnabled,
        dashboardEnabled: input.dashboardEnabled,
        writeEnabled: input.writeEnabled,
        completionEnabled: input.completionEnabled,
        clientPortalReadOnly: input.clientPortalReadOnly,
        internalAdminOnlyOverride: input.internalAdminOnlyOverride,
      },
    },

    clientSafeCommunication: {
      clientSafeMessageRequired: input.clientSafeMessageRequired,
      clientSafeMessageRef: input.clientSafeMessageRef,
      containsInternalStrategy: input.containsInternalStrategy,
      containsIncidentDetailsBeyondSafeDisclosure:
        input.containsIncidentDetailsBeyondSafeDisclosure,
    },

    auditEvidence: {
      auditLogRequired: input.auditLogRequired,
      auditLogWritten: input.auditLogWritten,
      auditEvidenceRefs: input.auditEvidenceRefs,
    },

    recoveryCriteria: {
      errorRateBackToBaseline: input.errorRateBackToBaseline,
      latencyBackToBaseline: input.latencyBackToBaseline,
      roleBoundaryClean: input.roleBoundaryClean,
      auditLogCoverageRestored: input.auditLogCoverageRestored,
      hotfixOrRollbackCompleted: input.hotfixOrRollbackCompleted,
      operatorRecoveryApprovalRequired: input.operatorRecoveryApprovalRequired,
    },

    exitReview: {
      exitReviewCompleted: input.exitReviewCompleted,
      reviewedByUserId: input.reviewedByUserId,
      reviewedAt: input.reviewedAt,
      recoveryNote: input.recoveryNote,
    },

    degradedModeGate: gate,
  };
}
