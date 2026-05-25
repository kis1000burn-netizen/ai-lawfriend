/**
 * Product Phase 53-F — Production Go-Live Control RC evidence schema SSOT.
 */
import { z } from "zod";

export const productionGoLiveControlRcStatusSchema = z.enum([
  "NOT_READY",
  "READY_FOR_RC",
  "BLOCKED",
  "LOCKED",
]);

export const productionGoLiveControlRcBoundarySchema = z.enum([
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53A_APPROVAL_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53B_MIGRATION_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53C_ROLE_SMOKE_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53D_ACTION_SMOKE_LOCK",
  "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53E_MONITORING_LOCK",
  "NO_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_RC_WITHOUT_ROLLBACK_READINESS",
  "NO_RC_WITH_CLIENT_BOUNDARY_RISK",
  "NO_RC_WITH_AUTO_COMPLETION_OR_AUTO_FILING_RISK",
  "NO_RC_WITHOUT_MASTER_VERIFY",
]);

export const productionGoLiveControlRcEvidenceSchema = z.object({
  phase: z.literal("53-F"),
  status: productionGoLiveControlRcStatusSchema,

  phaseLocks: z.object({
    phase53aApprovalLocked: z.boolean(),
    phase53bMigrationLocked: z.boolean(),
    phase53cRoleSmokeLocked: z.boolean(),
    phase53dActionSmokeLocked: z.boolean(),
    phase53eMonitoringLocked: z.boolean(),
  }),

  evidenceChain: z.object({
    approvalEvidenceRef: z.string().min(1),
    migrationEvidenceRef: z.string().min(1),
    roleSmokeEvidenceRef: z.string().min(1),
    actionSmokeEvidenceRef: z.string().min(1),
    monitoringEvidenceRef: z.string().min(1),
    implementationEvidenceRef: z.string().min(1),
    navigatorRef: z.string().min(1),
    chainComplete: z.boolean(),
  }),

  masterVerify: z.object({
    approvalGateVerifyPassed: z.boolean(),
    productionMigrationVerifyPassed: z.boolean(),
    productionRoleSmokeVerifyPassed: z.boolean(),
    productionActionSmokeVerifyPassed: z.boolean(),
    postGoLiveMonitoringVerifyPassed: z.boolean(),
    productionGoLiveControlRcVerifyPassed: z.boolean(),
  }),

  safetyBoundaries: z.object({
    clientInternalAccessBlocked: z.boolean(),
    staffAdminEscalationBlocked: z.boolean(),
    lawyerReviewBypassBlocked: z.boolean(),
    autoCompletionBlocked: z.boolean(),
    autoFilingBlocked: z.boolean(),
    autoSubmissionBlocked: z.boolean(),
    unreviewedEvidenceDownstreamBlocked: z.boolean(),
    clientInternalStrategyBlocked: z.boolean(),
  }),

  rollbackReadiness: z.object({
    readOnlyDegradeVerified: z.boolean(),
    rollbackFlagVerified: z.boolean(),
    rollbackRunbookRef: z.string().min(1),
    rollbackOwnerAvailable: z.boolean(),
  }),

  governanceDocs: z.object({
    implementationEvidenceUpdated: z.boolean(),
    navigatorUpdated: z.boolean(),
    deployPrecheckUpdated: z.boolean(),
    operationsIndexUpdated: z.boolean(),
    roadmapUpdated: z.boolean(),
    rcSummaryUpdated: z.boolean(),
  }),

  rcGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(productionGoLiveControlRcBoundarySchema),
  }),
});

export type ProductionGoLiveControlRcEvidence = z.infer<
  typeof productionGoLiveControlRcEvidenceSchema
>;

export const PRODUCTION_GO_LIVE_CONTROL_RC_IMPLEMENTATION_EVIDENCE_REF =
  "docs/project-governance/IMPLEMENTATION_EVIDENCE.md" as const;

export const PRODUCTION_GO_LIVE_CONTROL_RC_NAVIGATOR_REF =
  "tools/aibeopchin_navigator.py" as const;

export const PRODUCTION_GO_LIVE_CONTROL_RC_BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-reliability-go-live-approval-gate",
  "verify:aibeopchin-legal-reliability-production-migration-evidence",
  "verify:aibeopchin-legal-reliability-production-role-smoke",
  "verify:aibeopchin-legal-reliability-production-action-smoke",
  "verify:aibeopchin-legal-reliability-post-go-live-monitoring",
  "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
] as const;
