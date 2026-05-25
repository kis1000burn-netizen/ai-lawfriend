/**
 * Product Phase 54-C — Hotfix / Emergency Patch Governance schema SSOT.
 */
import { z } from "zod";

export const hotfixGovernanceStatusSchema = z.enum([
  "NOT_STARTED",
  "READY",
  "BLOCKED",
  "APPROVED",
  "PATCHED",
  "LOCKED",
]);

export const hotfixGovernanceBoundarySchema = z.enum([
  "NO_HOTFIX_WITHOUT_54B_INCIDENT_SEVERITY",
  "NO_HOTFIX_WITHOUT_SEVERITY_CLASSIFICATION",
  "NO_HOTFIX_WITHOUT_APPROVAL_CHAIN",
  "NO_HOTFIX_WITHOUT_SCOPE_LIMIT",
  "NO_HOTFIX_WITHOUT_ROLLBACK_PLAN",
  "NO_HOTFIX_WITHOUT_POST_PATCH_VERIFY",
  "NO_HOTFIX_WITHOUT_CUSTOMER_IMPACT_RECORD",
  "NO_EMERGENCY_PATCH_WITHOUT_AUDIT_LOG",
  "NO_MIGRATION_HOTFIX_WITHOUT_EXTRA_APPROVAL",
  "NO_HOTFIX_WITHOUT_CLOSEOUT_REVIEW",
]);

export const hotfixSeveritySchema = z.enum([
  "SEV_0",
  "SEV_1",
  "SEV_2",
  "SEV_3",
  "SEV_4",
]);

export const hotfixTypeSchema = z.enum([
  "EMERGENCY_PATCH",
  "HOTFIX",
  "STANDARD_PATCH",
  "CONFIG_ONLY",
  "ROLLBACK_ONLY",
]);

export const hotfixRiskAreaSchema = z.enum([
  "ROLE_BOUNDARY",
  "AUTOMATION_RISK",
  "ACTION_LOOP",
  "OPERATIONS_QUEUE",
  "AUDIT_LOG",
  "FEATURE_FLAG",
  "LATENCY",
  "CLIENT_UI",
  "DATABASE_MIGRATION",
]);

export const hotfixApprovalSchema = z.object({
  requestedByUserId: z.string().min(1),
  approvedByUserId: z.string().min(1),
  approvedByRole: z.enum([
    "ADMIN",
    "ENGINEERING_LEAD",
    "LEGAL_OPS_LEAD",
    "OWNER",
  ]),
  approvedAt: z.string().datetime(),
  approvalReason: z.string().min(1),
  rollbackOwnerUserId: z.string().min(1),
  rollbackOwnerAcknowledged: z.boolean(),
  extraMigrationApprovalUserId: z.string().min(1).optional(),
});

export const hotfixScopeSchema = z.object({
  scopeLimited: z.boolean(),
  affectedTenants: z.array(z.string()).min(1),
  affectedFeatures: z.array(z.string()).min(1),
  includesDatabaseMigration: z.boolean(),
  includesFeatureFlagChange: z.boolean(),
  includesClientVisibleChange: z.boolean(),
  includesLegalReliabilityBoundaryChange: z.boolean(),
});

export const hotfixVerificationSchema = z.object({
  prePatchVerifyCommand: z.string().min(1),
  postPatchVerifyCommand: z.string().min(1),
  rollbackVerifyCommand: z.string().min(1),
  prePatchVerifyPassed: z.boolean(),
  postPatchVerifyPassed: z.boolean(),
  rollbackVerifyPassed: z.boolean(),
  productionSmokeRequired: z.boolean(),
  productionSmokePassed: z.boolean(),
});

export const hotfixCustomerImpactSchema = z.object({
  customerImpactRecorded: z.boolean(),
  customerVisible: z.boolean(),
  customerCommunicationRequired: z.boolean(),
  customerCommunicationRef: z.string().optional(),
  incidentRef: z.string().min(1),
  severity: hotfixSeveritySchema,
});

export const hotfixGovernanceEvidenceSchema = z.object({
  phase: z.literal("54-C"),
  status: hotfixGovernanceStatusSchema,

  dependency: z.object({
    phase54bIncidentSeverityLocked: z.boolean(),
    incidentSeverityEvidenceRef: z.string().min(1),
  }),

  hotfixRequest: z.object({
    hotfixId: z.string().min(1),
    severity: hotfixSeveritySchema,
    hotfixType: hotfixTypeSchema,
    riskAreas: z.array(hotfixRiskAreaSchema).min(1),
    incidentRef: z.string().min(1),
    patchSummary: z.string().min(1),
  }),

  approval: hotfixApprovalSchema,

  scope: hotfixScopeSchema,

  rollbackPlan: z.object({
    rollbackPlanReady: z.boolean(),
    rollbackRunbookRef: z.string().min(1),
    rollbackOwnerAvailable: z.boolean(),
    rollbackTimeEstimateMinutes: z.number().int().positive(),
  }),

  verification: hotfixVerificationSchema,

  customerImpact: hotfixCustomerImpactSchema,

  auditEvidence: z.object({
    auditLogRequired: z.boolean(),
    auditLogWritten: z.boolean(),
    auditEvidenceRefs: z.array(z.string()).min(1),
  }),

  closeout: z.object({
    closeoutReviewCompleted: z.boolean(),
    closeoutReviewedByUserId: z.string().min(1).optional(),
    closedAt: z.string().datetime().optional(),
    closeoutNote: z.string().min(1).optional(),
  }),

  hotfixGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(hotfixGovernanceBoundarySchema),
  }),
});

export type HotfixGovernanceEvidence = z.infer<typeof hotfixGovernanceEvidenceSchema>;
