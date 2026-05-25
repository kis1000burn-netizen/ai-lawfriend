import { describe, expect, it } from "vitest";
import {
  assertLawyerFeedbackLearningTraceCreationAllowed,
  evaluateLawyerFeedbackLearningTraceCreation,
  evaluateLearningTraceReusability,
  PHASE59D_BOUNDARY_MARKERS,
} from "./phase59d-lawyer-feedback-learning.policy";
import {
  PHASE59D_LAWYER_FEEDBACK_LEARNING_EVIDENCE_TAG,
  PHASE59D_LAWYER_FEEDBACK_LEARNING_LOCK,
} from "./phase59d-lawyer-feedback-learning.lock";
import {
  createLawyerFeedbackLearningTraceService,
  canReuseLawyerFeedbackLearningTrace,
} from "./phase59d-lawyer-feedback-learning.service";
import type { CreateLawyerFeedbackLearningTraceInput } from "./phase59d-lawyer-feedback-learning.schema";

const baseInput: CreateLawyerFeedbackLearningTraceInput = {
  traceId: "learn-1",
  caseId: "case-1",
  tenantId: "tenant-1",
  sourceBundleId: "bundle-59c-1",
  suggestionType: "WEAKNESS",
  aiSuggestionId: "sugg-1",
  lawyerDecision: "APPROVED",
  lawyerReviewedAt: "2026-05-26T12:00:00.000Z",
  lawyerReviewerId: "lawyer-1",
  reusable: true,
  reusableScope: "CASE_ONLY",
  rawClientFactIncluded: false,
  anonymizedPatternRequired: false,
  auditRef: "audit:learn-1",
  aiSelfReviewed: false,
};

describe("Phase 59-D Lawyer Feedback Learning Loop", () => {
  it("blocks trace creation without lawyer decision", () => {
    const result = evaluateLawyerFeedbackLearningTraceCreation({
      ...baseInput,
      lawyerDecision: undefined as never,
      lawyerDecisionLedgerRef: "ledger:learn-1",
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION");
  });

  it("allows APPROVED trace reuse within CASE_ONLY scope", () => {
    const { trace } = createLawyerFeedbackLearningTraceService({
      ...baseInput,
      lawyerDecision: "APPROVED",
      reusableScope: "CASE_ONLY",
    });

    const reuse = canReuseLawyerFeedbackLearningTrace({
      trace,
      targetCaseId: "case-1",
      targetTenantId: "tenant-1",
    });

    expect(reuse.allowed).toBe(true);
  });

  it("allows MODIFIED trace reuse only with modified suggestion ref", () => {
    const withoutRef = createLawyerFeedbackLearningTraceService({
      ...baseInput,
      lawyerDecision: "MODIFIED",
      reusable: false,
      modifiedSuggestionRef: undefined,
    });

    expect(
      evaluateLearningTraceReusability({
        trace: withoutRef.trace,
        targetCaseId: "case-1",
        targetTenantId: "tenant-1",
      }).allowed,
    ).toBe(false);

    const withRef = createLawyerFeedbackLearningTraceService({
      ...baseInput,
      traceId: "learn-modified",
      lawyerDecision: "MODIFIED",
      modifiedSuggestionRef: "modified:sugg-1",
      reusable: true,
    });

    expect(
      canReuseLawyerFeedbackLearningTrace({
        trace: withRef.trace,
        targetCaseId: "case-1",
        targetTenantId: "tenant-1",
      }).allowed,
    ).toBe(true);
  });

  it("blocks REJECTED trace from reuse", () => {
    const { trace } = createLawyerFeedbackLearningTraceService({
      ...baseInput,
      traceId: "learn-rejected",
      lawyerDecision: "REJECTED",
      reusable: false,
    });

    expect(
      canReuseLawyerFeedbackLearningTrace({
        trace,
        targetCaseId: "case-1",
        targetTenantId: "tenant-1",
      }).allowed,
    ).toBe(false);
    expect(
      evaluateLearningTraceReusability({
        trace,
        targetCaseId: "case-1",
        targetTenantId: "tenant-1",
      }).blockedReasons,
    ).toContain("NO_REJECTED_SUGGESTION_REUSE");
  });

  it("blocks reusable trace when rawClientFactIncluded is true", () => {
    const result = evaluateLawyerFeedbackLearningTraceCreation({
      ...baseInput,
      rawClientFactIncluded: true as never,
      lawyerDecisionLedgerRef: "ledger:learn-1",
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("NO_RAW_CLIENT_FACT_IN_REUSABLE_TRACE");
  });

  it("requires anonymizedPatternRequired for SAME_CASE_TYPE_ANONYMIZED scope", () => {
    expect(() =>
      assertLawyerFeedbackLearningTraceCreationAllowed({
        ...baseInput,
        reusableScope: "SAME_CASE_TYPE_ANONYMIZED",
        anonymizedPatternRequired: false,
        lawyerDecisionLedgerRef: "ledger:learn-1",
      }),
    ).toThrow("NO_GLOBAL_REUSE_WITHOUT_ANONYMIZATION");

    const { trace } = createLawyerFeedbackLearningTraceService({
      ...baseInput,
      traceId: "learn-anon",
      reusableScope: "SAME_CASE_TYPE_ANONYMIZED",
      anonymizedPatternRequired: true,
    });

    expect(trace.anonymizedPatternRequired).toBe(true);
  });

  it("blocks trace without sourceBundleId", () => {
    expect(() =>
      assertLawyerFeedbackLearningTraceCreationAllowed({
        ...baseInput,
        sourceBundleId: "",
        lawyerDecisionLedgerRef: "ledger:learn-1",
      }),
    ).toThrow("NO_LEARNING_TRACE_WITHOUT_SOURCE_BUNDLE");
  });

  it("blocks trace without auditRef", () => {
    expect(() =>
      assertLawyerFeedbackLearningTraceCreationAllowed({
        ...baseInput,
        auditRef: "",
        lawyerDecisionLedgerRef: "ledger:learn-1",
      }),
    ).toThrow("NO_LEARNING_TRACE_WITHOUT_AUDIT_REF");
  });

  it("blocks cross-tenant reuse by default", () => {
    const { trace } = createLawyerFeedbackLearningTraceService({
      ...baseInput,
      traceId: "learn-tenant",
      reusableScope: "TENANT_ONLY",
    });

    expect(
      canReuseLawyerFeedbackLearningTrace({
        trace,
        targetCaseId: "case-2",
        targetTenantId: "tenant-2",
      }).blockedReasons,
    ).toContain("NO_CROSS_TENANT_LEARNING_WITHOUT_POLICY");
  });

  it("blocks AI self reinforcement without lawyer review", () => {
    const result = evaluateLawyerFeedbackLearningTraceCreation({
      ...baseInput,
      aiSelfReviewed: true as never,
      lawyerDecisionLedgerRef: "ledger:learn-1",
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("NO_AI_SELF_REINFORCEMENT_WITHOUT_REVIEW");
  });

  it("requires lawyer decision ledger on trace creation", () => {
    const { trace, decisionLedger } = createLawyerFeedbackLearningTraceService(baseInput);

    expect(trace.lawyerDecisionLedgerRef).toBe(decisionLedger.ledgerId);
    expect(decisionLedger.sourceMarker).toBe("phase59d-lawyer-feedback-learning-service");
    expect(decisionLedger.auditRef).toBe(baseInput.auditRef);
    expect(PHASE59D_BOUNDARY_MARKERS).toHaveLength(9);
    expect(PHASE59D_LAWYER_FEEDBACK_LEARNING_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE59D_LAWYER_FEEDBACK_LEARNING_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59D-LAWYER-FEEDBACK-LEARNING",
    );
  });
});
