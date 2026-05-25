/**
 * Product Phase 53-A — Production Go-Live Approval evidence schema SSOT.
 */
import { z } from "zod";

export const legalReliabilityGoLiveApprovalStatusSchema = z.enum([
  "NOT_READY",
  "READY_FOR_APPROVAL",
  "APPROVED",
  "BLOCKED",
  "REVOKED",
]);

export const legalReliabilityGoLiveApprovalBoundarySchema = z.enum([
  "NO_PRODUCTION_GO_LIVE_WITHOUT_STAGING_EVIDENCE",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_APPROVER_LEDGER",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_ROLLBACK_OWNER",
  "NO_PRODUCTION_GO_LIVE_WITH_FAILED_PREDEPLOY_RC",
  "NO_PRODUCTION_GO_LIVE_WITH_PENDING_MIGRATION_RISK",
  "NO_PRODUCTION_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS",
  "NO_PRODUCTION_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING",
  "NO_PRODUCTION_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM",
  "NO_PRODUCTION_GO_LIVE_WITHOUT_FEATURE_FLAG_KILL_SWITCH",
]);

export const legalReliabilityGoLiveApproverLedgerSchema = z.object({
  approvedByUserId: z.string().min(1),
  approvedByRole: z.enum(["ADMIN", "OWNER", "DEPLOY_MANAGER"]),
  approvedAt: z.string().datetime(),
  approvalReason: z.string().min(1),
  rollbackOwnerUserId: z.string().min(1),
  rollbackOwnerAcknowledged: z.boolean(),
});

export const legalReliabilityGoLiveApprovalEvidenceSchema = z.object({
  phase: z.literal("53-A"),
  status: legalReliabilityGoLiveApprovalStatusSchema,

  stagingEvidence: z.object({
    phase52RcPassed: z.boolean(),
    stagingEvidenceChecklistSigned: z.boolean(),
    stagingEvidenceRef: z.string().min(1),
    stagingRunbookRef: z.string().min(1),
  }),

  readinessChecks: z.object({
    productionReadinessRcPassed: z.boolean(),
    stagingLiveValidationRcPassed: z.boolean(),
    predeployCheckPassed: z.boolean(),
    prismaMigrationStatusClean: z.boolean(),
    schemaDriftDetected: z.boolean(),
    roleSmokePassed: z.boolean(),
    clientInternalAccessBlocked: z.boolean(),
    featureFlagKillSwitchVerified: z.boolean(),
    rollbackRunbookReady: z.boolean(),
  }),

  legalReliabilitySafetyChecks: z.object({
    autoCompletionDisabled: z.boolean(),
    autoFilingDisabled: z.boolean(),
    unreviewedEvidenceDownstreamBlocked: z.boolean(),
    lawyerDecisionLedgerRequired: z.boolean(),
    clientVisibleInternalStrategyBlocked: z.boolean(),
  }),

  approverLedger: legalReliabilityGoLiveApproverLedgerSchema.optional(),

  goLiveGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(legalReliabilityGoLiveApprovalBoundarySchema),
  }),
});

export type LegalReliabilityGoLiveApprovalEvidence = z.infer<
  typeof legalReliabilityGoLiveApprovalEvidenceSchema
>;

export type LegalReliabilityGoLiveApproverLedger = z.infer<
  typeof legalReliabilityGoLiveApproverLedgerSchema
>;

export const LEGAL_RELIABILITY_GO_LIVE_STAGING_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md" as const;

export const LEGAL_RELIABILITY_GO_LIVE_STAGING_RUNBOOK_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RUNBOOK.md" as const;
