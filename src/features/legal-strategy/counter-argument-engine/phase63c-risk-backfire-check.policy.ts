/**
 * Product Phase 63-C — Risk & Backfire Check policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { CounterArgumentCandidate } from "./phase63b-counter-argument-candidate.schema";
import { evaluateReasoningContextForCounterArgument } from "./phase63b-counter-argument-candidate.policy";
import type {
  BackfireRiskLevel,
  BackfireRiskRecommendation,
  BackfireRiskReport,
  BackfireRiskSignal,
  BuildBackfireRiskReportInput,
} from "./phase63c-risk-backfire-check.schema";
import {
  PHASE63C_RISK_BACKFIRE_CHECK_SCHEMA_MARKER,
  PHASE63C_RISK_BACKFIRE_CHECK_VERSION,
  backfireRiskReportBoundariesSchema,
  backfireRiskReportSchema,
} from "./phase63c-risk-backfire-check.schema";

export const PHASE63C_RISK_BACKFIRE_CHECK_POLICY_MARKER =
  "phase63c-risk-backfire-check-policy" as const;

export const PHASE63C_ONE_LINE_STANDARD =
  "Phase 63-C는 63-B CounterArgumentCandidate에 대해 반박 시 역효과, 우리 측 약점 노출, 증거 부족, 판례 불리성, 주장 모순 가능성을 점검하여 BackfireRiskReport를 생성하고, 위험 후보는 변호사 검토 전 문서·의뢰인·제출 흐름으로 연결하지 못하게 한다." as const;

export const PHASE63C_BOUNDARY_MARKERS = [
  "NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK",
  "NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL",
  "NO_CLIENT_VISIBLE_BACKFIRE_RISK",
  "NO_OVERSTATED_FACT_IN_COUNTER_ARGUMENT",
  "NO_WEAKNESS_EXPOSURE_WITHOUT_LAWYER_REVIEW",
  "NO_COUNTER_ARGUMENT_WITH_INCONSISTENT_SOURCE",
  "NO_UNFAVORABLE_JUDGMENT_IGNORED",
  "BACKFIRE_RISK_REPORT_AUDIT_REQUIRED",
  "LAWYER_REVIEW_REQUIRED_FOR_RISK_ACCEPTANCE",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type BackfireRiskBoundaryMarker = (typeof PHASE63C_BOUNDARY_MARKERS)[number];

export const PHASE63C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE63C_RISK_BACKFIRE_CHECK_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63c" as const;

export const PHASE63C_PHASE63B_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63b" as const;

const DEFAULT_BOUNDARIES = backfireRiskReportBoundariesSchema.parse({
  noCounterArgumentUseWithoutBackfireCheck: true,
  noDocumentUseWhenBackfireCritical: true,
  noClientVisibleBackfireRisk: true,
  noOverstatedFactInCounterArgument: true,
  noWeaknessExposureWithoutLawyerReview: true,
  noCounterArgumentWithInconsistentSource: true,
  noUnfavorableJudgmentIgnored: true,
  backfireRiskReportAuditRequired: true,
  lawyerReviewRequiredForRiskAcceptance: true,
  controlTowerBrainVerifyRequired: true,
});

const RISK_LEVEL_RANK: Record<BackfireRiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

const RECOMMENDATION_RANK: Record<BackfireRiskRecommendation, number> = {
  SAFE_TO_REVIEW: 1,
  REVIEW_WITH_CAUTION: 2,
  REQUIRES_REVISION: 3,
  DO_NOT_USE: 4,
};

export function evaluateCounterArgumentCandidateForBackfireCheck(input: {
  counterArgumentCandidate?: CounterArgumentCandidate;
  reasoningContext: GongbuhoReasoningContextBundle;
}) {
  if (!input.counterArgumentCandidate) {
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK" as const,
    };
  }
  if (!input.counterArgumentCandidate.sourceTrace.length) {
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITH_INCONSISTENT_SOURCE" as const,
    };
  }
  if (
    input.counterArgumentCandidate.reasoningContextAuditRef !==
    input.reasoningContext.auditRef
  ) {
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITH_INCONSISTENT_SOURCE" as const,
    };
  }

  const reasoningGate = evaluateReasoningContextForCounterArgument({
    reasoningContext: input.reasoningContext,
    caseId: input.counterArgumentCandidate.caseId,
    tenantId: input.counterArgumentCandidate.tenantId,
  });
  if (!reasoningGate.allowed) {
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITH_INCONSISTENT_SOURCE" as const,
    };
  }

  return { allowed: true as const, blockedBy: null };
}

export function computeBackfireRiskLevel(signals: BackfireRiskSignal[]): BackfireRiskLevel {
  if (signals.length === 0) {
    return "LOW";
  }

  let maxRank = 1;
  for (const signal of signals) {
    maxRank = Math.max(maxRank, RISK_LEVEL_RANK[signal.severity]);
  }

  if (maxRank >= 4) return "CRITICAL";
  if (maxRank >= 3) return "HIGH";
  if (maxRank >= 2) return "MEDIUM";
  return "LOW";
}

export function computeBackfireRiskRecommendation(input: {
  riskLevel: BackfireRiskLevel;
  riskSignals: BackfireRiskSignal[];
}): BackfireRiskRecommendation {
  if (input.riskLevel === "CRITICAL") {
    return "DO_NOT_USE";
  }

  const hasCriticalSignal = input.riskSignals.some(
    (signal) =>
      signal.riskType === "INCONSISTENT_WITH_PRIOR_STATEMENT" ||
      signal.riskType === "CLIENT_CONFIDENTIALITY_RISK",
  );
  if (hasCriticalSignal) {
    return "DO_NOT_USE";
  }

  if (input.riskLevel === "HIGH") {
    const highSignalCount = input.riskSignals.filter(
      (signal) => RISK_LEVEL_RANK[signal.severity] >= 3,
    ).length;
    return highSignalCount >= 2 ? "REQUIRES_REVISION" : "REVIEW_WITH_CAUTION";
  }

  if (input.riskLevel === "MEDIUM") {
    return "REVIEW_WITH_CAUTION";
  }

  return "SAFE_TO_REVIEW";
}

export function evaluateBackfireRiskReportForDocumentUse(report: BackfireRiskReport) {
  if (report.riskLevel === "CRITICAL" || report.recommendation === "DO_NOT_USE") {
    return {
      allowed: false as const,
      blockedBy: "NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL" as const,
    };
  }
  if (report.documentUseAllowed) {
    return { allowed: true as const, blockedBy: null };
  }
  return {
    allowed: false as const,
    blockedBy: "NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL" as const,
  };
}

export function evaluateBackfireRiskReportForClientVisibility(report: BackfireRiskReport) {
  if (report.clientVisibleAllowed) {
    return { allowed: true as const, blockedBy: null };
  }
  return {
    allowed: false as const,
    blockedBy: "NO_CLIENT_VISIBLE_BACKFIRE_RISK" as const,
  };
}

export function assertMinimumBackfireRecommendation(input: {
  recommendation: BackfireRiskRecommendation;
  minimum: BackfireRiskRecommendation;
}) {
  if (RECOMMENDATION_RANK[input.recommendation] < RECOMMENDATION_RANK[input.minimum]) {
    throw new ValidationError("NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL");
  }
}

export function buildBackfireRiskReport(input: BuildBackfireRiskReportInput): BackfireRiskReport {
  if (!input.auditRef.trim()) {
    throw new ValidationError("BACKFIRE_RISK_REPORT_AUDIT_REQUIRED");
  }

  const gate = evaluateCounterArgumentCandidateForBackfireCheck({
    counterArgumentCandidate: input.counterArgumentCandidate,
    reasoningContext: input.reasoningContext,
  });
  if (!gate.allowed) {
    throw new ValidationError(gate.blockedBy ?? "NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK");
  }

  for (const signal of input.riskSignals) {
    if (!signal.sourceTrace.length) {
      throw new ValidationError("NO_COUNTER_ARGUMENT_WITH_INCONSISTENT_SOURCE");
    }
  }

  const riskLevel = computeBackfireRiskLevel(input.riskSignals);
  const recommendation = computeBackfireRiskRecommendation({
    riskLevel,
    riskSignals: input.riskSignals,
  });

  const report: BackfireRiskReport = {
    marker: PHASE63C_RISK_BACKFIRE_CHECK_SCHEMA_MARKER,
    version: PHASE63C_RISK_BACKFIRE_CHECK_VERSION,
    reportId: input.reportId,
    caseId: input.counterArgumentCandidate.caseId,
    tenantId: input.counterArgumentCandidate.tenantId,
    sourceCounterArgumentCandidateId: input.counterArgumentCandidate.counterArgumentCandidateId,
    reasoningContextAuditRef: input.reasoningContext.auditRef,
    riskLevel,
    riskSignals: input.riskSignals,
    recommendation,
    reviewStatus: "LAWYER_REVIEW_REQUIRED",
    documentUseAllowed: false,
    clientVisibleAllowed: false,
    autoFileAllowed: false,
    boundaries: DEFAULT_BOUNDARIES,
    auditRef: input.auditRef,
    phase63BVerifyScript: PHASE63C_PHASE63B_VERIFY_SCRIPT,
    phase63CVerifyScript: PHASE63C_RISK_BACKFIRE_CHECK_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE63C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    checkedAt: new Date().toISOString(),
  };

  return backfireRiskReportSchema.parse(report);
}
