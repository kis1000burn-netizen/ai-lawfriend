/**
 * Product Phase 53-C — Production Role Smoke evidence schema SSOT.
 */
import { z } from "zod";

export const productionRoleSmokeStatusSchema = z.enum([
  "NOT_STARTED",
  "RUNNING",
  "PASSED",
  "FAILED",
  "BLOCKED",
  "LOCKED",
]);

export const productionRoleSchema = z.enum(["CLIENT", "LAWYER", "STAFF", "ADMIN"]);

export const productionRoleSmokeBoundarySchema = z.enum([
  "NO_PRODUCTION_ROLE_SMOKE_WITHOUT_53A_53B_LOCK",
  "NO_GO_LIVE_WITHOUT_PRODUCTION_ROLE_SMOKE",
  "NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY",
  "NO_CLIENT_ACCESS_TO_ACTION_OPERATIONS",
  "NO_CLIENT_ACCESS_TO_GO_LIVE_CONTROL",
  "NO_STAFF_ADMIN_PRIVILEGE_ESCALATION",
  "NO_LAWYER_COMPLETION_WITHOUT_REVIEW_BOUNDARY",
  "NO_ROLE_SMOKE_WITH_SHARED_OR_UNKNOWN_ACCOUNT",
  "NO_GO_LIVE_WITH_FAILED_AUTHZ_AUDIT_LOG",
]);

export const productionRoleSmokeCheckSchema = z.object({
  role: productionRoleSchema,
  accountRef: z.string().min(1),
  routeOrApi: z.string().min(1),
  expected: z.enum(["ALLOW", "DENY", "READ_ONLY"]),
  actual: z.enum(["ALLOW", "DENY", "READ_ONLY", "UNKNOWN"]),
  httpStatus: z.number().int().optional(),
  evidenceRef: z.string().min(1),
  passed: z.boolean(),
});

export const productionRoleSmokeEvidenceSchema = z.object({
  phase: z.literal("53-C"),
  status: productionRoleSmokeStatusSchema,

  dependency: z.object({
    phase53aLocked: z.boolean(),
    phase53bLocked: z.boolean(),
    approvalEvidenceRef: z.string().min(1),
    productionMigrationEvidenceRef: z.string().min(1),
  }),

  productionTarget: z.object({
    environment: z.literal("production"),
    appBaseUrlMasked: z.string().min(1),
    productionTenantRef: z.string().min(1),
    testCaseRef: z.string().min(1),
  }),

  accountSet: z.object({
    clientAccountRef: z.string().min(1),
    lawyerAccountRef: z.string().min(1),
    staffAccountRef: z.string().min(1),
    adminAccountRef: z.string().min(1),
    noSharedAccountUsed: z.boolean(),
    roleIdentityConfirmed: z.boolean(),
  }),

  checks: z.array(productionRoleSmokeCheckSchema).min(1),

  clientBoundary: z.object({
    internalLegalReliabilityBlocked: z.boolean(),
    actionOperationsBlocked: z.boolean(),
    goLiveControlBlocked: z.boolean(),
    internalStrategyGraphBlocked: z.boolean(),
  }),

  privilegedBoundary: z.object({
    staffAdminEscalationBlocked: z.boolean(),
    lawyerUnreviewedCompletionBlocked: z.boolean(),
    adminOnlyGoLiveControlVerified: z.boolean(),
  }),

  auditEvidence: z.object({
    authzAuditLogged: z.boolean(),
    deniedAccessEvidenceRefs: z.array(z.string()).min(1),
    allowedAccessEvidenceRefs: z.array(z.string()).min(1),
  }),

  goLiveGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(productionRoleSmokeBoundarySchema),
  }),
});

export type ProductionRoleSmokeEvidence = z.infer<typeof productionRoleSmokeEvidenceSchema>;

export const PRODUCTION_ROLE_SMOKE_APPROVAL_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md" as const;

export const PRODUCTION_ROLE_SMOKE_MIGRATION_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST.md" as const;

export const PRODUCTION_ROLE_SMOKE_MATRIX = {
  clientPortal: { CLIENT: "ALLOW", LAWYER: "READ_ONLY", STAFF: "READ_ONLY", ADMIN: "ALLOW" },
  lawyerWorkbench: { CLIENT: "DENY", LAWYER: "ALLOW", STAFF: "ALLOW", ADMIN: "ALLOW" },
  riskRadarGraphGap: { CLIENT: "DENY", LAWYER: "ALLOW", STAFF: "ALLOW", ADMIN: "ALLOW" },
  actionLoopReview: { CLIENT: "DENY", LAWYER: "ALLOW", STAFF: "READ_ONLY", ADMIN: "ALLOW" },
  actionOperationsQueue: { CLIENT: "DENY", LAWYER: "ALLOW", STAFF: "ALLOW", ADMIN: "ALLOW" },
  actionOperationsDashboard: { CLIENT: "DENY", LAWYER: "ALLOW", STAFF: "ALLOW", ADMIN: "ALLOW" },
  completionReview: { CLIENT: "DENY", LAWYER: "ALLOW", STAFF: "DENY", ADMIN: "ALLOW" },
  goLiveApproval: { CLIENT: "DENY", LAWYER: "DENY", STAFF: "DENY", ADMIN: "ALLOW" },
  productionMigrationEvidence: { CLIENT: "DENY", LAWYER: "DENY", STAFF: "READ_ONLY", ADMIN: "ALLOW" },
  featureFlagKillSwitch: { CLIENT: "DENY", LAWYER: "DENY", STAFF: "DENY", ADMIN: "ALLOW" },
} as const;
