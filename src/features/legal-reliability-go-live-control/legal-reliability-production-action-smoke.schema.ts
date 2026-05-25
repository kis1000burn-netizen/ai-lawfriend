/**
 * Product Phase 53-D — Production Action Loop / Operations smoke evidence schema SSOT.
 */
import { z } from "zod";

export const productionActionSmokeStatusSchema = z.enum([
  "NOT_STARTED",
  "RUNNING",
  "PASSED",
  "FAILED",
  "BLOCKED",
  "LOCKED",
]);

export const productionActionSmokeBoundarySchema = z.enum([
  "NO_PRODUCTION_ACTION_SMOKE_WITHOUT_53A_53B_53C_LOCK",
  "NO_GO_LIVE_WITHOUT_ACTION_LOOP_LIVE_SMOKE",
  "NO_AI_ACTION_WITHOUT_LAWYER_APPROVAL",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_DECISION_LEDGER",
  "NO_OPERATION_QUEUE_WITHOUT_APPROVED_ACTION",
  "NO_AUTO_OPERATION_COMPLETION_IN_PRODUCTION",
  "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION",
  "NO_AUTO_FILING_OR_AUTO_SUBMISSION_IN_PRODUCTION",
  "NO_ACTION_SMOKE_WITHOUT_AUDIT_EVIDENCE",
  "NO_CLIENT_VISIBLE_INTERNAL_STRATEGY_DURING_SMOKE",
]);

export const productionActionSmokeStepSchema = z.object({
  stepId: z.string().min(1),
  actorRole: z.enum(["LAWYER", "STAFF", "ADMIN", "SYSTEM", "CLIENT"]),
  target: z.string().min(1),
  expected: z.enum(["ALLOW", "DENY", "DRAFT_ONLY", "NO_SIDE_EFFECT"]),
  actual: z.enum(["ALLOW", "DENY", "DRAFT_ONLY", "NO_SIDE_EFFECT", "UNKNOWN"]),
  evidenceRef: z.string().min(1),
  passed: z.boolean(),
});

export const productionActionSmokeEvidenceSchema = z.object({
  phase: z.literal("53-D"),
  status: productionActionSmokeStatusSchema,

  dependency: z.object({
    phase53aLocked: z.boolean(),
    phase53bLocked: z.boolean(),
    phase53cLocked: z.boolean(),
    approvalEvidenceRef: z.string().min(1),
    migrationEvidenceRef: z.string().min(1),
    roleSmokeEvidenceRef: z.string().min(1),
  }),

  productionTarget: z.object({
    environment: z.literal("production"),
    appBaseUrlMasked: z.string().min(1),
    productionTenantRef: z.string().min(1),
    testCaseRef: z.string().min(1),
    testCaseIsSyntheticOrApproved: z.boolean(),
  }),

  actionLoopSmoke: z.object({
    riskRadarCandidateCreated: z.boolean(),
    graphGapCandidateCreated: z.boolean(),
    noSupplementRequestBeforeLawyerApproval: z.boolean(),
    lawyerDecisionLedgerRecorded: z.boolean(),
    supplementRequestDraftCreatedAfterApproval: z.boolean(),
    supplementRequestNotAutoSent: z.boolean(),
  }),

  actionOperationsSmoke: z.object({
    operationCreatedFromApprovedActionOnly: z.boolean(),
    assignmentAndDueDateVisible: z.boolean(),
    slaVisibleWithoutAutoEscalation: z.boolean(),
    completionRequiresLawyerReview: z.boolean(),
    autoCompletionDisabled: z.boolean(),
  }),

  downstreamSafety: z.object({
    unreviewedEvidenceDownstreamBlocked: z.boolean(),
    autoFilingDisabled: z.boolean(),
    autoSubmissionDisabled: z.boolean(),
    clientInternalStrategyBlocked: z.boolean(),
  }),

  smokeSteps: z.array(productionActionSmokeStepSchema).min(1),

  auditEvidence: z.object({
    auditLogged: z.boolean(),
    actionCandidateEvidenceRefs: z.array(z.string()).min(1),
    decisionLedgerRefs: z.array(z.string()).min(1),
    operationQueueEvidenceRefs: z.array(z.string()).min(1),
    deniedBoundaryEvidenceRefs: z.array(z.string()).min(1),
  }),

  goLiveGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(productionActionSmokeBoundarySchema),
  }),
});

export type ProductionActionSmokeEvidence = z.infer<typeof productionActionSmokeEvidenceSchema>;

export const PRODUCTION_ACTION_SMOKE_APPROVAL_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md" as const;

export const PRODUCTION_ACTION_SMOKE_MIGRATION_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST.md" as const;

export const PRODUCTION_ACTION_SMOKE_ROLE_SMOKE_EVIDENCE_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_CHECKLIST.md" as const;

export const PRODUCTION_ACTION_SMOKE_MINIMUM_PATH = [
  { stepId: "1", actorRole: "ADMIN", target: "production test case selection", expected: "ALLOW" },
  { stepId: "2", actorRole: "LAWYER", target: "Risk Radar action candidate", expected: "NO_SIDE_EFFECT" },
  { stepId: "3", actorRole: "LAWYER", target: "Graph Gap evidence request candidate", expected: "NO_SIDE_EFFECT" },
  { stepId: "4", actorRole: "LAWYER", target: "SupplementRequest before approval", expected: "DENY" },
  { stepId: "5", actorRole: "LAWYER", target: "candidate approval with decision ledger", expected: "ALLOW" },
  { stepId: "6", actorRole: "SYSTEM", target: "SupplementRequest DRAFT", expected: "DRAFT_ONLY" },
  { stepId: "7", actorRole: "SYSTEM", target: "Action Operations Queue", expected: "ALLOW" },
  { stepId: "8", actorRole: "STAFF", target: "assignment / due date / SLA", expected: "ALLOW" },
  { stepId: "9", actorRole: "CLIENT", target: "internal Action/Risk/Graph access", expected: "DENY" },
  { stepId: "10", actorRole: "LAWYER", target: "unreviewed evidence downstream", expected: "DENY" },
  { stepId: "11", actorRole: "LAWYER", target: "completion without review", expected: "DENY" },
  { stepId: "12", actorRole: "ADMIN", target: "smoke evidence / AuditLog", expected: "ALLOW" },
] as const;
