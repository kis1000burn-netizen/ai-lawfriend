import { describe, expect, it } from "vitest";
import { createLawyerFeedbackLearningTraceService } from "./phase59d-lawyer-feedback-learning.service";
import type { CreateLawyerFeedbackLearningTraceInput } from "./phase59d-lawyer-feedback-learning.schema";
import {
  buildReusableLegalPatternFromLearningTrace,
  canUseReusableLegalPatternForReasoningAssist,
} from "./phase59e-reusable-legal-pattern.builder";
import {
  assertReusableLegalPatternCreationAllowed,
  evaluateReusableLegalPatternCreation,
  evaluateReusableLegalPatternReasoningAssist,
  PHASE59E_BOUNDARY_MARKERS,
} from "./phase59e-reusable-legal-pattern.policy";
import {
  PHASE59E_REUSABLE_LEGAL_PATTERN_EVIDENCE_TAG,
  PHASE59E_REUSABLE_LEGAL_PATTERN_LOCK,
} from "./phase59e-reusable-legal-pattern.lock";

const traceInput: CreateLawyerFeedbackLearningTraceInput = {
  traceId: "learn-59e-1",
  caseId: "case-1",
  tenantId: "tenant-1",
  sourceBundleId: "bundle-59c-1",
  suggestionType: "WEAKNESS",
  aiSuggestionId: "sugg-1",
  lawyerDecision: "APPROVED",
  lawyerReviewedAt: "2026-05-26T12:00:00.000Z",
  lawyerReviewerId: "lawyer-1",
  reusable: true,
  reusableScope: "SAME_CASE_TYPE_ANONYMIZED",
  rawClientFactIncluded: false,
  anonymizedPatternRequired: true,
  auditRef: "audit:learn-59e-1",
  aiSelfReviewed: false,
};

const patternFields = {
  caseType: "LOAN_DISPUTE",
  issueTags: ["borrower-intent", "transfer-record"],
  abstractedPattern:
    "대여금 사건에서 송금내역은 있으나 차용 의사표시가 약한 경우 투자금 항변 가능성이 있다",
  recommendedUse: "약점 분석 보조",
  riskNotes: ["사실관계별 차이 확인 필요"],
  reuseScope: "CASE_TYPE_ANONYMIZED" as const,
  auditRef: "audit:pattern-1",
};

function buildApprovedTrace() {
  return createLawyerFeedbackLearningTraceService(traceInput).trace;
}

function buildModifiedTrace(withRef = true) {
  return createLawyerFeedbackLearningTraceService({
    ...traceInput,
    traceId: withRef ? "learn-59e-modified" : "learn-59e-modified-no-ref",
    lawyerDecision: "MODIFIED",
    modifiedSuggestionRef: withRef ? "modified:sugg-1" : undefined,
    reusable: withRef,
  }).trace;
}

function buildRejectedTrace() {
  return createLawyerFeedbackLearningTraceService({
    ...traceInput,
    traceId: "learn-59e-rejected",
    lawyerDecision: "REJECTED",
    reusable: false,
  }).trace;
}

describe("Phase 59-E Reusable Legal Pattern Library", () => {
  it("blocks pattern creation from REJECTED trace", () => {
    const sourceTrace = buildRejectedTrace();

    expect(() =>
      buildReusableLegalPatternFromLearningTrace({
        patternId: "pattern-rejected",
        sourceTrace,
        ...patternFields,
      }),
    ).toThrow("NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE");

    expect(
      evaluateReusableLegalPatternCreation({
        patternInput: {
          patternId: "pattern-rejected",
          sourceTraceIds: [sourceTrace.traceId],
          tenantId: "tenant-1",
          patternType: "WEAKNESS_PATTERN",
          sourceDecision: "LAWYER_APPROVED",
          rawClientFactIncluded: false,
          anonymizationVerified: true,
          status: "DRAFT",
          clientDirectVisible: false,
          ...patternFields,
        },
        sourceTrace,
      }).blockedReasons,
    ).toContain("NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE");
  });

  it("allows APPROVED trace to become a pattern candidate", () => {
    const pattern = buildReusableLegalPatternFromLearningTrace({
      patternId: "pattern-approved",
      sourceTrace: buildApprovedTrace(),
      ...patternFields,
    });

    expect(pattern.sourceDecision).toBe("LAWYER_APPROVED");
    expect(pattern.patternType).toBe("WEAKNESS_PATTERN");
    expect(pattern.status).toBe("DRAFT");
  });

  it("allows MODIFIED trace only with modified suggestion ref", () => {
    const withoutRef = buildModifiedTrace(false);

    expect(() =>
      buildReusableLegalPatternFromLearningTrace({
        patternId: "pattern-modified-no-ref",
        sourceTrace: withoutRef,
        ...patternFields,
      }),
    ).toThrow("MODIFIED_PATTERN_REF_REQUIRED");

    const pattern = buildReusableLegalPatternFromLearningTrace({
      patternId: "pattern-modified",
      sourceTrace: buildModifiedTrace(true),
      ...patternFields,
    });

    expect(pattern.sourceDecision).toBe("LAWYER_MODIFIED");
    expect(pattern.modifiedPatternRef).toBe("modified:sugg-1");
  });

  it("blocks pattern creation when rawClientFactIncluded is true", () => {
    const sourceTrace = buildApprovedTrace();

    expect(
      evaluateReusableLegalPatternCreation({
        patternInput: {
          patternId: "pattern-raw-fact",
          sourceTraceIds: [sourceTrace.traceId],
          tenantId: "tenant-1",
          patternType: "WEAKNESS_PATTERN",
          sourceDecision: "LAWYER_APPROVED",
          rawClientFactIncluded: true as never,
          anonymizationVerified: true,
          status: "DRAFT",
          clientDirectVisible: false,
          ...patternFields,
        },
        sourceTrace,
      }).blockedReasons,
    ).toContain("NO_RAW_CLIENT_FACT_IN_PATTERN");
  });

  it("blocks reuse when anonymizationVerified is false", () => {
    expect(() =>
      assertReusableLegalPatternCreationAllowed({
        patternInput: {
          patternId: "pattern-no-anon",
          sourceTraceIds: ["learn-59e-1"],
          tenantId: "tenant-1",
          patternType: "WEAKNESS_PATTERN",
          sourceDecision: "LAWYER_APPROVED",
          rawClientFactIncluded: false,
          anonymizationVerified: false as never,
          status: "DRAFT",
          clientDirectVisible: false,
          ...patternFields,
        },
        sourceTrace: buildApprovedTrace(),
      }),
    ).toThrow("NO_PATTERN_WITHOUT_ANONYMIZATION");
  });

  it("blocks pattern without sourceTraceIds", () => {
    expect(() =>
      assertReusableLegalPatternCreationAllowed({
        patternInput: {
          patternId: "pattern-no-source",
          sourceTraceIds: [],
          tenantId: "tenant-1",
          patternType: "WEAKNESS_PATTERN",
          sourceDecision: "LAWYER_APPROVED",
          rawClientFactIncluded: false,
          anonymizationVerified: true,
          status: "DRAFT",
          clientDirectVisible: false,
          ...patternFields,
        },
        sourceTrace: buildApprovedTrace(),
      }),
    ).toThrow("NO_PATTERN_WITHOUT_SOURCE_TRACE");
  });

  it("blocks pattern without auditRef", () => {
    expect(() =>
      assertReusableLegalPatternCreationAllowed({
        patternInput: {
          patternId: "pattern-no-audit",
          sourceTraceIds: ["learn-59e-1"],
          tenantId: "tenant-1",
          patternType: "WEAKNESS_PATTERN",
          sourceDecision: "LAWYER_APPROVED",
          rawClientFactIncluded: false,
          anonymizationVerified: true,
          status: "DRAFT",
          clientDirectVisible: false,
          ...patternFields,
          auditRef: "",
        },
        sourceTrace: buildApprovedTrace(),
      }),
    ).toThrow("NO_PATTERN_WITHOUT_AUDIT_REF");
  });

  it("blocks GLOBAL_ANONYMIZED without extra governance", () => {
    expect(() =>
      buildReusableLegalPatternFromLearningTrace({
        patternId: "pattern-global",
        sourceTrace: buildApprovedTrace(),
        ...patternFields,
        reuseScope: "GLOBAL_ANONYMIZED",
        globalGovernanceApproved: false,
      }),
    ).toThrow("NO_GLOBAL_PATTERN_WITHOUT_EXTRA_GOVERNANCE");

    const pattern = buildReusableLegalPatternFromLearningTrace({
      patternId: "pattern-global-approved",
      sourceTrace: buildApprovedTrace(),
      ...patternFields,
      reuseScope: "GLOBAL_ANONYMIZED",
      globalGovernanceApproved: true,
    });

    expect(pattern.reuseScope).toBe("GLOBAL_ANONYMIZED");
  });

  it("blocks TENANT_ONLY pattern use in another tenant", () => {
    const pattern = buildReusableLegalPatternFromLearningTrace({
      patternId: "pattern-tenant",
      sourceTrace: buildApprovedTrace(),
      ...patternFields,
      reuseScope: "TENANT_ONLY",
      status: "APPROVED_FOR_REUSE",
    });

    expect(
      canUseReusableLegalPatternForReasoningAssist({
        pattern,
        targetTenantId: "tenant-2",
      }).blockedReasons,
    ).toContain("NO_CROSS_TENANT_PATTERN_WITHOUT_POLICY");
  });

  it("blocks client direct visible patterns", () => {
    const sourceTrace = buildApprovedTrace();

    expect(
      evaluateReusableLegalPatternCreation({
        patternInput: {
          patternId: "pattern-client-visible",
          sourceTraceIds: [sourceTrace.traceId],
          tenantId: "tenant-1",
          patternType: "WEAKNESS_PATTERN",
          sourceDecision: "LAWYER_APPROVED",
          rawClientFactIncluded: false,
          anonymizationVerified: true,
          status: "DRAFT",
          clientDirectVisible: true as never,
          ...patternFields,
        },
        sourceTrace,
      }).blockedReasons,
    ).toContain("NO_PATTERN_DIRECTLY_VISIBLE_TO_CLIENT");
  });

  it("allows only APPROVED_FOR_REUSE patterns for reasoning assist", () => {
    const draftPattern = buildReusableLegalPatternFromLearningTrace({
      patternId: "pattern-draft",
      sourceTrace: buildApprovedTrace(),
      ...patternFields,
      status: "DRAFT",
    });

    expect(
      evaluateReusableLegalPatternReasoningAssist({
        pattern: draftPattern,
        targetTenantId: "tenant-1",
      }).blockedReasons,
    ).toContain("PATTERN_NOT_APPROVED_FOR_REUSE");

    const approvedPattern = buildReusableLegalPatternFromLearningTrace({
      patternId: "pattern-reuse",
      sourceTrace: buildApprovedTrace(),
      ...patternFields,
      status: "APPROVED_FOR_REUSE",
    });

    expect(
      canUseReusableLegalPatternForReasoningAssist({
        pattern: approvedPattern,
        targetTenantId: "tenant-1",
      }).allowed,
    ).toBe(true);

    expect(PHASE59E_BOUNDARY_MARKERS).toHaveLength(10);
    expect(PHASE59E_REUSABLE_LEGAL_PATTERN_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE59E_REUSABLE_LEGAL_PATTERN_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59E-REUSABLE-LEGAL-PATTERN",
    );
  });
});
