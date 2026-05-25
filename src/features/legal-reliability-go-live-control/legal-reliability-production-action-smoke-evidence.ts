/**
 * Product Phase 53-D — Production Action Loop / Operations smoke evidence builder SSOT.
 */
import { evaluateProductionActionSmokeGate } from "./legal-reliability-production-action-smoke.policy";
import {
  PRODUCTION_ACTION_SMOKE_APPROVAL_EVIDENCE_REF,
  PRODUCTION_ACTION_SMOKE_MIGRATION_EVIDENCE_REF,
  PRODUCTION_ACTION_SMOKE_ROLE_SMOKE_EVIDENCE_REF,
} from "./legal-reliability-production-action-smoke.schema";

export const LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_EVIDENCE_MARKER =
  "phase53d-legal-reliability-production-action-smoke-evidence" as const;

export function buildProductionActionSmokeEvidence(input: {
  phase53aLocked: boolean;
  phase53bLocked: boolean;
  phase53cLocked: boolean;
  approvalEvidenceRef?: string;
  migrationEvidenceRef?: string;
  roleSmokeEvidenceRef?: string;

  appBaseUrlMasked: string;
  productionTenantRef: string;
  testCaseRef: string;
  testCaseIsSyntheticOrApproved: boolean;

  riskRadarCandidateCreated: boolean;
  graphGapCandidateCreated: boolean;
  noSupplementRequestBeforeLawyerApproval: boolean;
  lawyerDecisionLedgerRecorded: boolean;
  supplementRequestDraftCreatedAfterApproval: boolean;
  supplementRequestNotAutoSent: boolean;

  operationCreatedFromApprovedActionOnly: boolean;
  assignmentAndDueDateVisible: boolean;
  slaVisibleWithoutAutoEscalation: boolean;
  completionRequiresLawyerReview: boolean;
  autoCompletionDisabled: boolean;

  unreviewedEvidenceDownstreamBlocked: boolean;
  autoFilingDisabled: boolean;
  autoSubmissionDisabled: boolean;
  clientInternalStrategyBlocked: boolean;

  smokeSteps: Array<{
    stepId: string;
    actorRole: "LAWYER" | "STAFF" | "ADMIN" | "SYSTEM" | "CLIENT";
    target: string;
    expected: "ALLOW" | "DENY" | "DRAFT_ONLY" | "NO_SIDE_EFFECT";
    actual: "ALLOW" | "DENY" | "DRAFT_ONLY" | "NO_SIDE_EFFECT" | "UNKNOWN";
    evidenceRef: string;
    passed: boolean;
  }>;

  auditLogged: boolean;
  actionCandidateEvidenceRefs: string[];
  decisionLedgerRefs: string[];
  operationQueueEvidenceRefs: string[];
  deniedBoundaryEvidenceRefs: string[];
}) {
  const gate = evaluateProductionActionSmokeGate({
    phase53aLocked: input.phase53aLocked,
    phase53bLocked: input.phase53bLocked,
    phase53cLocked: input.phase53cLocked,
    testCaseIsSyntheticOrApproved: input.testCaseIsSyntheticOrApproved,
    allSmokeStepsPassed: input.smokeSteps.every((step) => step.passed),

    riskRadarCandidateCreated: input.riskRadarCandidateCreated,
    graphGapCandidateCreated: input.graphGapCandidateCreated,
    noSupplementRequestBeforeLawyerApproval: input.noSupplementRequestBeforeLawyerApproval,
    lawyerDecisionLedgerRecorded: input.lawyerDecisionLedgerRecorded,
    supplementRequestDraftCreatedAfterApproval: input.supplementRequestDraftCreatedAfterApproval,
    supplementRequestNotAutoSent: input.supplementRequestNotAutoSent,

    operationCreatedFromApprovedActionOnly: input.operationCreatedFromApprovedActionOnly,
    assignmentAndDueDateVisible: input.assignmentAndDueDateVisible,
    slaVisibleWithoutAutoEscalation: input.slaVisibleWithoutAutoEscalation,
    completionRequiresLawyerReview: input.completionRequiresLawyerReview,
    autoCompletionDisabled: input.autoCompletionDisabled,

    unreviewedEvidenceDownstreamBlocked: input.unreviewedEvidenceDownstreamBlocked,
    autoFilingDisabled: input.autoFilingDisabled,
    autoSubmissionDisabled: input.autoSubmissionDisabled,
    clientInternalStrategyBlocked: input.clientInternalStrategyBlocked,

    auditLogged: input.auditLogged,
    actionCandidateEvidencePresent: input.actionCandidateEvidenceRefs.length > 0,
    decisionLedgerEvidencePresent: input.decisionLedgerRefs.length > 0,
    operationQueueEvidencePresent: input.operationQueueEvidenceRefs.length > 0,
    deniedBoundaryEvidencePresent: input.deniedBoundaryEvidenceRefs.length > 0,
  });

  return {
    phase: "53-D" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    dependency: {
      phase53aLocked: input.phase53aLocked,
      phase53bLocked: input.phase53bLocked,
      phase53cLocked: input.phase53cLocked,
      approvalEvidenceRef: input.approvalEvidenceRef ?? PRODUCTION_ACTION_SMOKE_APPROVAL_EVIDENCE_REF,
      migrationEvidenceRef: input.migrationEvidenceRef ?? PRODUCTION_ACTION_SMOKE_MIGRATION_EVIDENCE_REF,
      roleSmokeEvidenceRef: input.roleSmokeEvidenceRef ?? PRODUCTION_ACTION_SMOKE_ROLE_SMOKE_EVIDENCE_REF,
    },

    productionTarget: {
      environment: "production" as const,
      appBaseUrlMasked: input.appBaseUrlMasked,
      productionTenantRef: input.productionTenantRef,
      testCaseRef: input.testCaseRef,
      testCaseIsSyntheticOrApproved: input.testCaseIsSyntheticOrApproved,
    },

    actionLoopSmoke: {
      riskRadarCandidateCreated: input.riskRadarCandidateCreated,
      graphGapCandidateCreated: input.graphGapCandidateCreated,
      noSupplementRequestBeforeLawyerApproval: input.noSupplementRequestBeforeLawyerApproval,
      lawyerDecisionLedgerRecorded: input.lawyerDecisionLedgerRecorded,
      supplementRequestDraftCreatedAfterApproval: input.supplementRequestDraftCreatedAfterApproval,
      supplementRequestNotAutoSent: input.supplementRequestNotAutoSent,
    },

    actionOperationsSmoke: {
      operationCreatedFromApprovedActionOnly: input.operationCreatedFromApprovedActionOnly,
      assignmentAndDueDateVisible: input.assignmentAndDueDateVisible,
      slaVisibleWithoutAutoEscalation: input.slaVisibleWithoutAutoEscalation,
      completionRequiresLawyerReview: input.completionRequiresLawyerReview,
      autoCompletionDisabled: input.autoCompletionDisabled,
    },

    downstreamSafety: {
      unreviewedEvidenceDownstreamBlocked: input.unreviewedEvidenceDownstreamBlocked,
      autoFilingDisabled: input.autoFilingDisabled,
      autoSubmissionDisabled: input.autoSubmissionDisabled,
      clientInternalStrategyBlocked: input.clientInternalStrategyBlocked,
    },

    smokeSteps: input.smokeSteps,

    auditEvidence: {
      auditLogged: input.auditLogged,
      actionCandidateEvidenceRefs: input.actionCandidateEvidenceRefs,
      decisionLedgerRefs: input.decisionLedgerRefs,
      operationQueueEvidenceRefs: input.operationQueueEvidenceRefs,
      deniedBoundaryEvidenceRefs: input.deniedBoundaryEvidenceRefs,
    },

    goLiveGate: gate,
  };
}
