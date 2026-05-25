import { describe, expect, it } from "vitest";
import {
  assertCanInjectIntoPromptContext,
  assertCanUseAsStrongReasoningGround,
  assertCanUseInClientVisibleOutput,
  canUseAsStrongReasoningGround,
  canUseInClientVisibleOutput,
} from "./phase59b-real-time-legal-signal-compiler";
import {
  assertRealTimeLegalSignalSourceTrace,
  assertRealTimeLegalSignalTransitionAllowed,
  canTransitionRealTimeLegalSignalStatus,
  evaluateRealTimeLegalSignalScope,
  PHASE59B_BOUNDARY_MARKERS,
} from "./phase59b-real-time-legal-signal.policy";
import {
  PHASE59B_REAL_TIME_LEGAL_SIGNAL_EVIDENCE_TAG,
  PHASE59B_REAL_TIME_LEGAL_SIGNAL_LOCK,
} from "./phase59b-real-time-legal-signal.lock";
import {
  realTimeLegalSignalSchema,
  type RealTimeLegalSignal,
} from "./phase59b-real-time-legal-signal.schema";

const NOW = new Date("2026-05-26T12:00:00.000Z");

function buildSignal(overrides: Partial<RealTimeLegalSignal> = {}): RealTimeLegalSignal {
  return realTimeLegalSignalSchema.parse({
    signalId: "sig-1",
    caseId: "case-1",
    tenantId: "tenant-1",
    title: "대법원 2024다12345",
    summaryPointer: "statute://civil/act-750/amended-2024-03-01",
    signalKind: "PRECEDENT",
    status: "APPROVED_FOR_AI_USE",
    sourceReliability: "HIGH",
    conflictStatus: "CLEAR",
    caseRelevanceScore: 0.82,
    lawyerReviewRequired: false,
    lawyerReviewed: true,
    staleAfter: "2026-06-26T12:00:00.000Z",
    fetchedAt: "2026-05-26T10:00:00.000Z",
    updatedAt: "2026-05-26T11:00:00.000Z",
    sourceTrace: {
      traceId: "trace-1",
      sourceKind: "PRECEDENT",
      canonicalSourceRef: "SCOURT:2024DA12345",
      summaryPointer: "holding: loan-nature dispute burden shift",
      fetchedAt: "2026-05-26T10:00:00.000Z",
      verifiedAt: "2026-05-26T10:30:00.000Z",
    },
    compilerPolicyApplied: true,
    caseScopeOnly: true,
    tenantIsolationRequired: true,
    ...overrides,
  });
}

describe("Phase 59-B Real-time Legal Signal", () => {
  it("blocks FETCHED status signal from strong reasoning ground", () => {
    const signal = buildSignal({ status: "FETCHED" });
    const result = canUseAsStrongReasoningGround(signal, NOW);

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL");
    expect(result.blockedReasons).toContain("REAL_TIME_SIGNAL_NOT_AUTHORITY");
    expect(() => assertCanUseAsStrongReasoningGround(signal, NOW)).toThrow(
      "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL",
    );
  });

  it("allows only APPROVED_FOR_AI_USE status as strong reasoning ground", () => {
    const approved = canUseAsStrongReasoningGround(buildSignal(), NOW);
    const lawyerReviewPath = canUseAsStrongReasoningGround(
      buildSignal({
        status: "APPROVED_FOR_AI_USE",
        lawyerReviewRequired: true,
        lawyerReviewed: true,
      }),
      NOW,
    );

    expect(approved.allowed).toBe(true);
    expect(lawyerReviewPath.allowed).toBe(true);
  });

  it("blocks CONFLICTED signal until lawyer review completes", () => {
    const signal = buildSignal({
      status: "CONFLICTED",
      conflictStatus: "CONFLICTED",
      lawyerReviewRequired: true,
      lawyerReviewed: false,
    });

    expect(canUseAsStrongReasoningGround(signal, NOW).allowed).toBe(false);
    expect(canUseAsStrongReasoningGround(signal, NOW).blockedReasons).toContain(
      "NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW",
    );
  });

  it("excludes STALE signal from AI context", () => {
    const signal = buildSignal({
      status: "STALE",
      staleAfter: "2026-05-25T12:00:00.000Z",
    });

    expect(canUseAsStrongReasoningGround(signal, NOW).allowed).toBe(false);
    expect(canUseAsStrongReasoningGround(signal, NOW).blockedReasons).toContain(
      "NO_STALE_SIGNAL_IN_AI_CONTEXT",
    );
  });

  it("rejects signal without sourceTrace", () => {
    expect(() =>
      assertRealTimeLegalSignalSourceTrace({
        sourceTrace: { traceId: "", canonicalSourceRef: "", summaryPointer: "" },
      }),
    ).toThrow("SOURCE_TRACE_REQUIRED_FOR_EVERY_SIGNAL");
  });

  it("blocks prompt context injection without compiler policy", () => {
    const signal = buildSignal({ compilerPolicyApplied: false });

    expect(
      canUseAsStrongReasoningGround(signal, NOW).blockedReasons,
    ).toContain("COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE");

    expect(() =>
      assertCanInjectIntoPromptContext(signal, { compilerPolicyApplied: false }, NOW),
    ).toThrow("COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE");
  });

  it("rejects signal without tenant/case scope", () => {
    const missingScope = evaluateRealTimeLegalSignalScope({
      caseId: "",
      tenantId: "",
      caseScopeOnly: true,
      tenantIsolationRequired: true,
    });

    expect(missingScope.allowed).toBe(false);
    expect(missingScope.blockedReason).toBe("CASE_AND_TENANT_SCOPE_REQUIRED");

    const brokenFlags = evaluateRealTimeLegalSignalScope({
      caseId: "case-1",
      tenantId: "tenant-1",
      caseScopeOnly: false,
      tenantIsolationRequired: true,
    });

    expect(brokenFlags.allowed).toBe(false);
    expect(brokenFlags.blockedReason).toBe("CASE_SCOPE_FIRST");
  });

  it("allows client visible output only for lawyer approved signals", () => {
    const approved = buildSignal({ lawyerReviewed: true });
    const pending = buildSignal({
      lawyerReviewRequired: false,
      lawyerReviewed: false,
    });

    expect(canUseInClientVisibleOutput(approved, NOW).allowed).toBe(true);
    expect(canUseInClientVisibleOutput(pending, NOW).allowed).toBe(false);
    expect(canUseInClientVisibleOutput(pending, NOW).blockedReasons).toContain(
      "NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW",
    );
    expect(() => assertCanUseInClientVisibleOutput(pending, NOW)).toThrow(
      "NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW",
    );
  });

  it("enforces forward status transitions and blocks terminal re-entry", () => {
    expect(canTransitionRealTimeLegalSignalStatus({ fromStatus: "FETCHED", toStatus: "NORMALIZED" }).allowed).toBe(
      true,
    );
    expect(canTransitionRealTimeLegalSignalStatus({ fromStatus: "FETCHED", toStatus: "APPROVED_FOR_AI_USE" }).allowed).toBe(
      false,
    );
    expect(() =>
      assertRealTimeLegalSignalTransitionAllowed({ fromStatus: "REJECTED", toStatus: "NORMALIZED" }),
    ).toThrow("SIGNAL_STATUS_TRANSITION_BLOCKED_FROM_TERMINAL");
    expect(PHASE59B_BOUNDARY_MARKERS).toHaveLength(9);
    expect(PHASE59B_REAL_TIME_LEGAL_SIGNAL_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE59B_REAL_TIME_LEGAL_SIGNAL_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59B-REAL-TIME-LEGAL-SIGNAL",
    );
  });
});
