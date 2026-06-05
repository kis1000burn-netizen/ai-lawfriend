/**
 * Product Phase 63-C — Risk & Backfire Check service SSOT.
 */
import { randomUUID } from "node:crypto";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { CounterArgumentCandidate } from "./phase63b-counter-argument-candidate.schema";
import { buildBackfireRiskReport } from "./phase63c-risk-backfire-check.policy";
import type {
  BackfireRiskSignal,
  BackfireRiskReport,
  RunBackfireRiskCheckInput,
} from "./phase63c-risk-backfire-check.schema";
import { backfireRiskReportSchema } from "./phase63c-risk-backfire-check.schema";

const OVERSTATED_FACT_PATTERNS = [
  /명백히/i,
  /확실히/i,
  /반드시/i,
  /단정/i,
  /100%/,
  /틀림없/i,
];

const WEAKNESS_EXPOSURE_PATTERNS = [/약점/i, /weakness/i, /불리한\s*사실/i, /clientWeakness/i];

const CONFIDENTIALITY_PATTERNS = [
  /의뢰인\s*비밀/i,
  /기밀\s*유지/i,
  /client\s*confidential/i,
];

const UNFAVORABLE_JUDGMENT_PATTERNS = [/불리/i, /unfavorable/i, /기각/i, /패소/i];

function baseSignalTrace(
  candidate: CounterArgumentCandidate,
): BackfireRiskSignal["sourceTrace"] {
  return [
    {
      traceId: randomUUID(),
      sourceKind: "GONGBUHO_REASONING_CONTEXT",
      sourceRef: candidate.reasoningContextAuditRef,
      reasoningContextAuditRef: candidate.reasoningContextAuditRef,
      opponentArgumentId: candidate.sourceOpponentArgumentId,
      capturedAt: new Date().toISOString(),
    },
  ];
}

function detectOverstatedFact(candidate: CounterArgumentCandidate): BackfireRiskSignal | null {
  const text = `${candidate.decomposition.counterDirection} ${candidate.opponentArgumentTitle}`;
  if (!OVERSTATED_FACT_PATTERNS.some((pattern) => pattern.test(text))) {
    return null;
  }

  return {
    signalId: randomUUID(),
    riskType: "OVERSTATED_FACT",
    severity: "HIGH",
    summary: "반박 방향에 과도한 사실 단정 표현이 포함됨",
    sourceTrace: baseSignalTrace(candidate),
    mitigationSuggestion: "확정되지 않은 사실은 단정 표현을 완화하고 근거 범위를 명시",
  };
}

function detectWeaknessExposure(candidate: CounterArgumentCandidate): BackfireRiskSignal | null {
  const text = `${candidate.decomposition.counterDirection} ${candidate.decomposition.weakLinkAnalysis}`;
  if (!WEAKNESS_EXPOSURE_PATTERNS.some((pattern) => pattern.test(text))) {
    return null;
  }

  return {
    signalId: randomUUID(),
    riskType: "OUR_WEAKNESS_EXPOSURE",
    severity: "HIGH",
    summary: "반박 과정에서 우리 측 약점 노출 가능성이 감지됨",
    sourceTrace: baseSignalTrace(candidate),
    mitigationSuggestion: "약점 관련 표현을 변호사 검토용 내부 메모로 분리",
  };
}

function detectInsufficientEvidence(
  candidate: CounterArgumentCandidate,
): BackfireRiskSignal | null {
  if (
    candidate.decomposition.weakLinkScore < 0.6 &&
    candidate.decomposition.additionalEvidenceNeeded.length === 0
  ) {
    return null;
  }

  return {
    signalId: randomUUID(),
    riskType: "INSUFFICIENT_EVIDENCE",
    severity: "MEDIUM",
    summary: "반박 방향 대비 입증자료 또는 추가 증거가 부족함",
    sourceTrace: baseSignalTrace(candidate),
    mitigationSuggestion: "추가 증거 확보 또는 반박 범위 축소 후 재검토",
  };
}

function detectInconsistentWithPriorStatement(input: {
  candidate: CounterArgumentCandidate;
  reasoningContext: GongbuhoReasoningContextBundle;
}): BackfireRiskSignal | null {
  const counterText = input.candidate.decomposition.counterDirection.toLowerCase();
  for (const fact of input.reasoningContext.memoryGrounds.confirmedFacts) {
    const factSummary = fact.summary.toLowerCase();
    const contradicts =
      (factSummary.includes("계약") && counterText.includes("계약이 존재하지 않")) ||
      (factSummary.includes("이행") && counterText.includes("이행하지 않"));
    if (contradicts) {
      return {
        signalId: randomUUID(),
        riskType: "INCONSISTENT_WITH_PRIOR_STATEMENT",
        severity: "CRITICAL",
        summary: `반박 방향이 확정 사실(${fact.factId})과 충돌할 가능성이 있음`,
        sourceTrace: baseSignalTrace(input.candidate),
        mitigationSuggestion: "기존 진술·서면과의 정합성을 변호사가 우선 검토",
      };
    }
  }
  return null;
}

function detectUnfavorableJudgmentLink(
  candidate: CounterArgumentCandidate,
): BackfireRiskSignal | null {
  for (const basis of candidate.decomposition.gongbuhoBasisRefs) {
    if (basis.basisKind !== "JUDGMENT_LINK") {
      continue;
    }
    if (UNFAVORABLE_JUDGMENT_PATTERNS.some((pattern) => pattern.test(basis.summary))) {
      return {
        signalId: randomUUID(),
        riskType: "UNFAVORABLE_JUDGMENT_LINK",
        severity: "HIGH",
        summary: `연결된 판례 근거(${basis.ref})가 불리하게 해석될 여지가 있음`,
        sourceTrace: baseSignalTrace(candidate),
        mitigationSuggestion: "판례 인용 범위와 사실관계 차이를 재검토",
      };
    }
  }
  return null;
}

function detectOpponentRebuttalOpening(
  candidate: CounterArgumentCandidate,
): BackfireRiskSignal | null {
  if (candidate.decomposition.weakLinkScore < 0.75) {
    return null;
  }

  return {
    signalId: randomUUID(),
    riskType: "OPPONENT_REBUTTAL_OPENING",
    severity: "MEDIUM",
    summary: "상대방이 재반박하기 쉬운 반박 구조가 감지됨",
    sourceTrace: baseSignalTrace(candidate),
    mitigationSuggestion: "반박 논점을 좁히고 증거 연결을 강화",
  };
}

function detectClientConfidentialityRisk(
  candidate: CounterArgumentCandidate,
): BackfireRiskSignal | null {
  const text = `${candidate.decomposition.counterDirection} ${candidate.opponentArgumentTitle}`;
  if (!CONFIDENTIALITY_PATTERNS.some((pattern) => pattern.test(text))) {
    return null;
  }

  return {
    signalId: randomUUID(),
    riskType: "CLIENT_CONFIDENTIALITY_RISK",
    severity: "CRITICAL",
    summary: "의뢰인 기밀 또는 민감 정보 노출 위험이 감지됨",
    sourceTrace: baseSignalTrace(candidate),
    mitigationSuggestion: "기밀 정보는 문서 초안에서 제외하고 변호사 검토 후 재작성",
  };
}

export function detectBackfireRiskSignals(input: {
  counterArgumentCandidate: CounterArgumentCandidate;
  reasoningContext: GongbuhoReasoningContextBundle;
}): BackfireRiskSignal[] {
  const detectors = [
    detectOverstatedFact(input.counterArgumentCandidate),
    detectWeaknessExposure(input.counterArgumentCandidate),
    detectInsufficientEvidence(input.counterArgumentCandidate),
    detectInconsistentWithPriorStatement({
      candidate: input.counterArgumentCandidate,
      reasoningContext: input.reasoningContext,
    }),
    detectUnfavorableJudgmentLink(input.counterArgumentCandidate),
    detectOpponentRebuttalOpening(input.counterArgumentCandidate),
    detectClientConfidentialityRisk(input.counterArgumentCandidate),
  ];

  return detectors.filter((signal): signal is BackfireRiskSignal => signal !== null);
}

export function runBackfireRiskCheck(input: RunBackfireRiskCheckInput): BackfireRiskReport {
  const riskSignals = detectBackfireRiskSignals({
    counterArgumentCandidate: input.counterArgumentCandidate,
    reasoningContext: input.reasoningContext,
  });

  return backfireRiskReportSchema.parse(
    buildBackfireRiskReport({
      reportId: input.reportId,
      counterArgumentCandidate: input.counterArgumentCandidate,
      reasoningContext: input.reasoningContext,
      riskSignals,
      auditRef: input.auditRef,
    }),
  );
}

export function summarizeBackfireRiskReport(report: BackfireRiskReport) {
  return {
    reportId: report.reportId,
    sourceCounterArgumentCandidateId: report.sourceCounterArgumentCandidateId,
    riskLevel: report.riskLevel,
    recommendation: report.recommendation,
    signalCount: report.riskSignals.length,
    documentUseAllowed: report.documentUseAllowed,
    clientVisibleAllowed: report.clientVisibleAllowed,
    autoFileAllowed: report.autoFileAllowed,
  };
}
