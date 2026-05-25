import { describe, expect, it } from "vitest";
import { buildProductionActionSmokeEvidence } from "./legal-reliability-production-action-smoke-evidence";
import {
  assertProductionActionSmokeGateAllowed,
  evaluateProductionActionSmokeGate,
} from "./legal-reliability-production-action-smoke.policy";
import {
  LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_VERSION,
} from "./legal-reliability-production-action-smoke-rc-lock";
import { productionActionSmokeEvidenceSchema } from "./legal-reliability-production-action-smoke.schema";

const baseInput = {
  phase53aLocked: true,
  phase53bLocked: true,
  phase53cLocked: true,
  testCaseIsSyntheticOrApproved: true,
  allSmokeStepsPassed: true,
  riskRadarCandidateCreated: true,
  graphGapCandidateCreated: true,
  noSupplementRequestBeforeLawyerApproval: true,
  lawyerDecisionLedgerRecorded: true,
  supplementRequestDraftCreatedAfterApproval: true,
  supplementRequestNotAutoSent: true,
  operationCreatedFromApprovedActionOnly: true,
  assignmentAndDueDateVisible: true,
  slaVisibleWithoutAutoEscalation: true,
  completionRequiresLawyerReview: true,
  autoCompletionDisabled: true,
  unreviewedEvidenceDownstreamBlocked: true,
  autoFilingDisabled: true,
  autoSubmissionDisabled: true,
  clientInternalStrategyBlocked: true,
  auditLogged: true,
  actionCandidateEvidencePresent: true,
  decisionLedgerEvidencePresent: true,
  operationQueueEvidencePresent: true,
  deniedBoundaryEvidencePresent: true,
};

const satisfiedEvidenceInput = {
  phase53aLocked: true,
  phase53bLocked: true,
  phase53cLocked: true,
  appBaseUrlMasked: "https://***.aibeopchin.app",
  productionTenantRef: "prod-tenant-001",
  testCaseRef: "case-prod-action-smoke-001",
  testCaseIsSyntheticOrApproved: true,
  riskRadarCandidateCreated: true,
  graphGapCandidateCreated: true,
  noSupplementRequestBeforeLawyerApproval: true,
  lawyerDecisionLedgerRecorded: true,
  supplementRequestDraftCreatedAfterApproval: true,
  supplementRequestNotAutoSent: true,
  operationCreatedFromApprovedActionOnly: true,
  assignmentAndDueDateVisible: true,
  slaVisibleWithoutAutoEscalation: true,
  completionRequiresLawyerReview: true,
  autoCompletionDisabled: true,
  unreviewedEvidenceDownstreamBlocked: true,
  autoFilingDisabled: true,
  autoSubmissionDisabled: true,
  clientInternalStrategyBlocked: true,
  smokeSteps: [
    {
      stepId: "2",
      actorRole: "LAWYER" as const,
      target: "Risk Radar action candidate",
      expected: "NO_SIDE_EFFECT" as const,
      actual: "NO_SIDE_EFFECT" as const,
      evidenceRef: "audit/risk-radar-candidate.json",
      passed: true,
    },
    {
      stepId: "6",
      actorRole: "SYSTEM" as const,
      target: "SupplementRequest DRAFT",
      expected: "DRAFT_ONLY" as const,
      actual: "DRAFT_ONLY" as const,
      evidenceRef: "audit/supplement-request-draft.json",
      passed: true,
    },
  ],
  auditLogged: true,
  actionCandidateEvidenceRefs: ["audit/risk-radar-candidate.json"],
  decisionLedgerRefs: ["audit/lawyer-decision-ledger.json"],
  operationQueueEvidenceRefs: ["audit/operation-queue-entry.json"],
  deniedBoundaryEvidenceRefs: ["audit/client-internal-deny.json"],
};

describe("Phase 53-D Production Action Loop / Operations Live Smoke", () => {
  it("blocks action smoke without Phase 53-A, 53-B, and 53-C lock", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      phase53cLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53A_53B_53C_LOCK_REQUIRED");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        phase53cLocked: false,
      }),
    ).toThrow("NO_PRODUCTION_ACTION_SMOKE_WITHOUT_53A_53B_53C_LOCK");
  });

  it("blocks action smoke when production test case is not synthetic or approved", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      testCaseIsSyntheticOrApproved: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("APPROVED_PRODUCTION_TEST_CASE_REQUIRED");
  });

  it("blocks action smoke when Risk Radar candidate creation is not verified", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      riskRadarCandidateCreated: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ACTION_CANDIDATE_CREATION_NOT_VERIFIED");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        riskRadarCandidateCreated: false,
      }),
    ).toThrow("NO_AI_ACTION_WITHOUT_LAWYER_APPROVAL");
  });

  it("blocks action smoke when Graph Gap candidate creation is not verified", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      graphGapCandidateCreated: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ACTION_CANDIDATE_CREATION_NOT_VERIFIED");
  });

  it("blocks action smoke when SupplementRequest exists before lawyer approval", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      noSupplementRequestBeforeLawyerApproval: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CLIENT_REQUEST_CREATED_WITHOUT_LAWYER_APPROVAL");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        noSupplementRequestBeforeLawyerApproval: false,
      }),
    ).toThrow("NO_AI_ACTION_WITHOUT_LAWYER_APPROVAL");
  });

  it("blocks action smoke when lawyer decision ledger is missing", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      lawyerDecisionLedgerRecorded: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("LAWYER_DECISION_LEDGER_REQUIRED");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        lawyerDecisionLedgerRecorded: false,
      }),
    ).toThrow("NO_CLIENT_REQUEST_WITHOUT_LAWYER_DECISION_LEDGER");
  });

  it("blocks action smoke when SupplementRequest is not DRAFT-only or auto-sent after approval", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      supplementRequestNotAutoSent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SUPPLEMENT_REQUEST_DRAFT_ONLY_BOUNDARY_FAILED");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        supplementRequestDraftCreatedAfterApproval: false,
      }),
    ).toThrow("NO_CLIENT_REQUEST_WITHOUT_LAWYER_DECISION_LEDGER");
  });

  it("blocks action smoke when operation queue is created without approved action", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      operationCreatedFromApprovedActionOnly: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("OPERATION_QUEUE_WITHOUT_APPROVED_ACTION");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        operationCreatedFromApprovedActionOnly: false,
      }),
    ).toThrow("NO_OPERATION_QUEUE_WITHOUT_APPROVED_ACTION");
  });

  it("blocks action smoke when SLA auto-escalation occurs", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      slaVisibleWithoutAutoEscalation: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SLA_AUTO_ESCALATION_RISK");
  });

  it("blocks action smoke when completion is possible without lawyer review", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      autoCompletionDisabled: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("AUTO_COMPLETION_OR_REVIEW_BYPASS_RISK");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        completionRequiresLawyerReview: false,
      }),
    ).toThrow("NO_AUTO_OPERATION_COMPLETION_IN_PRODUCTION");
  });

  it("blocks action smoke when unreviewed evidence can flow downstream", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      unreviewedEvidenceDownstreamBlocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("UNREVIEWED_EVIDENCE_DOWNSTREAM_RISK");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        unreviewedEvidenceDownstreamBlocked: false,
      }),
    ).toThrow("NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION");
  });

  it("blocks action smoke when auto filing or auto submission is enabled", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      autoFilingDisabled: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("AUTO_FILING_OR_SUBMISSION_RISK");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        autoSubmissionDisabled: false,
      }),
    ).toThrow("NO_AUTO_FILING_OR_AUTO_SUBMISSION_IN_PRODUCTION");
  });

  it("blocks action smoke when CLIENT can see internal strategy during smoke", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      clientInternalStrategyBlocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CLIENT_INTERNAL_STRATEGY_VISIBILITY_RISK");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        clientInternalStrategyBlocked: false,
      }),
    ).toThrow("NO_CLIENT_VISIBLE_INTERNAL_STRATEGY_DURING_SMOKE");
  });

  it("blocks action smoke when audit evidence is missing", () => {
    const result = evaluateProductionActionSmokeGate({
      ...baseInput,
      auditLogged: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ACTION_SMOKE_AUDIT_EVIDENCE_REQUIRED");
    expect(() =>
      assertProductionActionSmokeGateAllowed({
        ...baseInput,
        decisionLedgerEvidencePresent: false,
      }),
    ).toThrow("NO_ACTION_SMOKE_WITHOUT_AUDIT_EVIDENCE");
  });

  it("allows action smoke gate only when all production action boundaries are verified", () => {
    const result = evaluateProductionActionSmokeGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(10);

    const evidence = buildProductionActionSmokeEvidence(satisfiedEvidenceInput);
    const parsed = productionActionSmokeEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.goLiveGate.allowed).toBe(true);
    expect(LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_VERSION).toBe("53-D.1");
    expect(LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-production-action-smoke",
    );
    expect(LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53D-PRODUCTION-ACTION-LOOP-OPERATIONS-SMOKE",
    );
  });
});
