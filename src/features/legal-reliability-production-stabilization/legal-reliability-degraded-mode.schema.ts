/**
 * Product Phase 54-D — Customer-safe Rollout Window / Degraded Mode schema SSOT.
 */
import { z } from "zod";

export const degradedModeStatusSchema = z.enum([
  "NOT_STARTED",
  "READY",
  "DEGRADED",
  "RECOVERING",
  "RECOVERED",
  "BLOCKED",
  "LOCKED",
]);

export const degradedModeBoundarySchema = z.enum([
  "NO_DEGRADED_MODE_WITHOUT_54B_54C_LOCK",
  "NO_DEGRADE_WITHOUT_SEVERITY_TRIGGER",
  "NO_DEGRADE_WITHOUT_OPERATOR_APPROVAL",
  "NO_DEGRADE_WITHOUT_TENANT_OR_FEATURE_SCOPE",
  "NO_DEGRADE_WITHOUT_CLIENT_SAFE_MESSAGE",
  "NO_DEGRADE_WITHOUT_READ_ONLY_FALLBACK",
  "NO_DEGRADE_WITHOUT_WRITE_COMPLETION_DISABLE_CONTROL",
  "NO_DEGRADE_WITHOUT_AUDIT_LOG",
  "NO_DEGRADE_WITHOUT_RECOVERY_CRITERIA",
  "NO_DEGRADE_WITHOUT_EXIT_REVIEW",
]);

export const degradedModeSeveritySchema = z.enum([
  "SEV_0",
  "SEV_1",
  "SEV_2",
  "SEV_3",
  "SEV_4",
]);

export const degradedModeTypeSchema = z.enum([
  "READ_ONLY",
  "ACTION_LOOP_DISABLED",
  "OPERATIONS_WRITE_DISABLED",
  "COMPLETION_DISABLED",
  "DASHBOARD_READ_ONLY",
  "TENANT_ISOLATED",
  "FEATURE_PARTIAL_DISABLED",
  "FULL_SAFE_MODE",
]);

export const degradedModeScopeSchema = z.object({
  scopeLimited: z.boolean(),
  affectedTenants: z.array(z.string()).min(1),
  affectedFeatures: z.array(z.string()).min(1),
  globalDisable: z.boolean(),
  tenantIsolationApplied: z.boolean(),
});

export const degradedModeControlStateSchema = z.object({
  actionLoopEnabled: z.boolean(),
  actionOperationsEnabled: z.boolean(),
  dashboardEnabled: z.boolean(),
  writeEnabled: z.boolean(),
  completionEnabled: z.boolean(),
  clientPortalReadOnly: z.boolean(),
  internalAdminOnlyOverride: z.boolean(),
});

export const degradedModeClientMessageSchema = z.object({
  clientSafeMessageRequired: z.boolean(),
  clientSafeMessageRef: z.string().optional(),
  containsInternalStrategy: z.boolean(),
  containsIncidentDetailsBeyondSafeDisclosure: z.boolean(),
});

export const degradedModeRecoveryCriteriaSchema = z.object({
  errorRateBackToBaseline: z.boolean(),
  latencyBackToBaseline: z.boolean(),
  roleBoundaryClean: z.boolean(),
  auditLogCoverageRestored: z.boolean(),
  hotfixOrRollbackCompleted: z.boolean(),
  operatorRecoveryApprovalRequired: z.boolean(),
});

export const degradedModeEvidenceSchema = z.object({
  phase: z.literal("54-D"),
  status: degradedModeStatusSchema,

  dependency: z.object({
    phase54bIncidentSeverityLocked: z.boolean(),
    phase54cHotfixGovernanceLocked: z.boolean(),
    incidentSeverityEvidenceRef: z.string().min(1),
    hotfixGovernanceEvidenceRef: z.string().min(1),
  }),

  trigger: z.object({
    incidentRef: z.string().min(1),
    severity: degradedModeSeveritySchema,
    triggerReason: z.string().min(1),
    triggeredAt: z.string().datetime(),
  }),

  operatorApproval: z.object({
    approved: z.boolean(),
    approvedByUserId: z.string().min(1),
    approvedAt: z.string().datetime(),
    approvalReason: z.string().min(1),
  }),

  degradedMode: z.object({
    modeTypes: z.array(degradedModeTypeSchema).min(1),
    scope: degradedModeScopeSchema,
    controlState: degradedModeControlStateSchema,
  }),

  clientSafeCommunication: degradedModeClientMessageSchema,

  auditEvidence: z.object({
    auditLogRequired: z.boolean(),
    auditLogWritten: z.boolean(),
    auditEvidenceRefs: z.array(z.string()).min(1),
  }),

  recoveryCriteria: degradedModeRecoveryCriteriaSchema,

  exitReview: z.object({
    exitReviewCompleted: z.boolean(),
    reviewedByUserId: z.string().min(1).optional(),
    reviewedAt: z.string().datetime().optional(),
    recoveryNote: z.string().min(1).optional(),
  }),

  degradedModeGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(degradedModeBoundarySchema),
  }),
});

export type DegradedModeEvidence = z.infer<typeof degradedModeEvidenceSchema>;
