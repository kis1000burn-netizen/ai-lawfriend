/**
 * Product Phase 63-B — Counter-Argument Candidate Builder service SSOT.
 */
import { randomUUID } from "node:crypto";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { ReusableLegalPattern } from "@/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.schema";
import type { StrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import type { OpponentArgument } from "./phase63a-opponent-argument.schema";
import { buildCounterArgumentCandidate } from "./phase63b-counter-argument-candidate.policy";
import type {
  BuildCounterArgumentCandidateFromOpponentArgumentInput,
  CounterArgumentCandidate,
  CounterArgumentDecomposition,
  CounterArgumentGongbuhoBasisRef,
  CounterArgumentSourceTrace,
} from "./phase63b-counter-argument-candidate.schema";
import { counterArgumentCandidateSchema } from "./phase63b-counter-argument-candidate.schema";

function pickLinkedStrategyCandidate(
  opponentArgument: OpponentArgument,
  strategyCandidates: StrategyCandidate[],
): StrategyCandidate | undefined {
  return strategyCandidates.find(
    (candidate) =>
      (candidate.candidateKind === "COUNTER_ARGUMENT" ||
        candidate.candidateKind === "COMPOSITE") &&
      candidate.caseId === opponentArgument.caseId &&
      candidate.tenantId === opponentArgument.tenantId,
  );
}

function buildGongbuhoBasisRefs(
  reasoningContext: GongbuhoReasoningContextBundle,
  reusablePatterns: ReusableLegalPattern[],
): CounterArgumentGongbuhoBasisRef[] {
  const basisRefs: CounterArgumentGongbuhoBasisRef[] =
    reasoningContext.memoryGrounds.confirmedFacts.slice(0, 2).map((fact) => ({
      basisId: randomUUID(),
      basisKind: "CONFIRMED_FACT" as const,
      ref: fact.factId,
      summary: fact.summary,
    }));

  for (const link of reasoningContext.memoryGrounds.judgmentLinks.slice(0, 1)) {
    basisRefs.push({
      basisId: randomUUID(),
      basisKind: "JUDGMENT_LINK" as const,
      ref: link.referenceId,
      summary: link.relevanceSummary,
    });
  }

  for (const evidence of reasoningContext.memoryGrounds.evidenceMap.slice(0, 1)) {
    basisRefs.push({
      basisId: randomUUID(),
      basisKind: "EVIDENCE_MAP" as const,
      ref: evidence.linkId,
      summary: `${evidence.claimRef} ↔ ${evidence.evidenceRef} (${evidence.supportStrength})`,
    });
  }

  for (const pattern of reusablePatterns.slice(0, 1)) {
    basisRefs.push({
      basisId: randomUUID(),
      basisKind: "REUSABLE_PATTERN" as const,
      ref: pattern.patternId,
      summary: pattern.abstractedPattern,
    });
  }

  if (basisRefs.length === 0) {
    basisRefs.push({
      basisId: randomUUID(),
      basisKind: "CONFIRMED_FACT" as const,
      ref: "fallback-basis",
      summary: "변호사 확인 공부호 근거 검토 필요",
    });
  }

  return basisRefs;
}

function buildWeakLinkAnalysis(opponentArgument: OpponentArgument): {
  weakLinkAnalysis: string;
  weakLinkScore: number;
} {
  const disputedPremises = opponentArgument.premiseFacts.filter(
    (premise) => premise.factStatus === "DISPUTED" || premise.factStatus === "ALLEGED",
  );
  const weakEvidenceCount = opponentArgument.submittedEvidence.filter(
    (evidence) => evidence.supportRole !== "PRIMARY",
  ).length;

  if (disputedPremises.length > 0) {
    return {
      weakLinkAnalysis: `상대방 전제 사실 ${disputedPremises.length}건이 확정되지 않아 입증 연결고리가 약함`,
      weakLinkScore: Math.min(0.95, 0.55 + disputedPremises.length * 0.15),
    };
  }

  if (weakEvidenceCount > 0) {
    return {
      weakLinkAnalysis: "상대방 제출 증거의 1차 입증력 또는 연결고리가 약함",
      weakLinkScore: 0.68,
    };
  }

  return {
    weakLinkAnalysis: "상대방 주장의 사실·증거 연결을 추가 검토할 여지가 있음",
    weakLinkScore: 0.45,
  };
}

export function buildCounterArgumentDecomposition(input: {
  opponentArgument: OpponentArgument;
  reasoningContext: GongbuhoReasoningContextBundle;
  reusablePatterns: ReusableLegalPattern[];
}): CounterArgumentDecomposition {
  const weakLink = buildWeakLinkAnalysis(input.opponentArgument);
  const gongbuhoBasisRefs = buildGongbuhoBasisRefs(
    input.reasoningContext,
    input.reusablePatterns,
  );
  const primaryBasis = gongbuhoBasisRefs[0]?.summary ?? "공부호 근거";

  return {
    opponentClaimSummary: input.opponentArgument.summary,
    premiseFacts: input.opponentArgument.premiseFacts.map((premise) => ({
      premiseId: premise.premiseId,
      summary: premise.summary,
      factStatus: premise.factStatus,
    })),
    submittedEvidence: input.opponentArgument.submittedEvidence.map((evidence) => ({
      evidenceId: evidence.evidenceId,
      evidenceRef: evidence.evidenceRef,
      title: evidence.title,
      summary: evidence.summary,
    })),
    weakLinkAnalysis: weakLink.weakLinkAnalysis,
    weakLinkScore: weakLink.weakLinkScore,
    gongbuhoBasisRefs,
    counterDirection: `상대방 주장 "${input.opponentArgument.title}"에 대해 ${primaryBasis}를 중심으로 반박 방향을 검토`,
    additionalEvidenceNeeded:
      weakLink.weakLinkScore >= 0.6
        ? [
            {
              evidenceId: randomUUID(),
              title: "상대방 주장 대응 보강 자료",
              rationale: weakLink.weakLinkAnalysis,
              priorityScore: weakLink.weakLinkScore,
            },
          ]
        : [],
  };
}

function buildSourceTrace(input: {
  opponentArgument: OpponentArgument;
  reasoningContext: GongbuhoReasoningContextBundle;
  strategyCandidate?: StrategyCandidate;
  reusablePatterns: ReusableLegalPattern[];
}): CounterArgumentSourceTrace[] {
  const capturedAt = new Date().toISOString();
  const traces: CounterArgumentSourceTrace[] = [
    {
      traceId: randomUUID(),
      sourceKind: "OPPONENT_ARGUMENT",
      sourceRef: input.opponentArgument.opponentArgumentId,
      reasoningContextAuditRef: input.reasoningContext.auditRef,
      opponentArgumentId: input.opponentArgument.opponentArgumentId,
      capturedAt,
    },
    {
      traceId: randomUUID(),
      sourceKind: "GONGBUHO_REASONING_CONTEXT",
      sourceRef: input.reasoningContext.auditRef,
      reasoningContextAuditRef: input.reasoningContext.auditRef,
      opponentArgumentId: input.opponentArgument.opponentArgumentId,
      capturedAt,
    },
  ];

  if (input.strategyCandidate) {
    traces.push({
      traceId: randomUUID(),
      sourceKind: "STRATEGY_CANDIDATE",
      sourceRef: input.strategyCandidate.candidateId,
      reasoningContextAuditRef: input.reasoningContext.auditRef,
      opponentArgumentId: input.opponentArgument.opponentArgumentId,
      strategyCandidateId: input.strategyCandidate.candidateId,
      capturedAt,
    });
  }

  for (const pattern of input.reusablePatterns) {
    traces.push({
      traceId: randomUUID(),
      sourceKind: "REUSABLE_LEGAL_PATTERN",
      sourceRef: pattern.patternId,
      reasoningContextAuditRef: input.reasoningContext.auditRef,
      opponentArgumentId: input.opponentArgument.opponentArgumentId,
      reusablePatternId: pattern.patternId,
      capturedAt,
    });
  }

  return traces;
}

export function buildCounterArgumentCandidateFromOpponentArgument(
  input: BuildCounterArgumentCandidateFromOpponentArgumentInput,
): CounterArgumentCandidate {
  const strategyCandidate = pickLinkedStrategyCandidate(
    input.opponentArgument,
    input.strategyCandidates ?? [],
  );
  const reusablePatterns = input.reusablePatterns ?? [];
  const decomposition = buildCounterArgumentDecomposition({
    opponentArgument: input.opponentArgument,
    reasoningContext: input.reasoningContext,
    reusablePatterns,
  });

  return buildCounterArgumentCandidate({
    counterArgumentCandidateId: input.counterArgumentCandidateId ?? randomUUID(),
    opponentArgument: input.opponentArgument,
    reasoningContext: input.reasoningContext,
    decomposition,
    strategyCandidate,
    reusablePatterns,
    sourceTrace: buildSourceTrace({
      opponentArgument: input.opponentArgument,
      reasoningContext: input.reasoningContext,
      strategyCandidate,
      reusablePatterns,
    }),
    auditRef: input.auditRef,
  });
}

export function generateCounterArgumentCandidatesFromOpponentArguments(input: {
  opponentArguments: OpponentArgument[];
  reasoningContext: GongbuhoReasoningContextBundle;
  strategyCandidates?: StrategyCandidate[];
  reusablePatterns?: ReusableLegalPattern[];
  auditRef: string;
}): CounterArgumentCandidate[] {
  return input.opponentArguments.map((opponentArgument) =>
    counterArgumentCandidateSchema.parse(
      buildCounterArgumentCandidateFromOpponentArgument({
        opponentArgument,
        reasoningContext: input.reasoningContext,
        strategyCandidates: input.strategyCandidates ?? [],
        reusablePatterns: input.reusablePatterns ?? [],
        auditRef: input.auditRef,
      }),
    ),
  );
}

export function summarizeCounterArgumentCandidate(candidate: CounterArgumentCandidate) {
  return {
    counterArgumentCandidateId: candidate.counterArgumentCandidateId,
    sourceOpponentArgumentId: candidate.sourceOpponentArgumentId,
    reviewStatus: candidate.reviewStatus,
    weakLinkScore: candidate.decomposition.weakLinkScore,
    isFinalLegalArgument: candidate.isFinalLegalArgument,
    autoFileAllowed: candidate.autoFileAllowed,
    clientVisibleByDefault: candidate.clientVisibleByDefault,
  };
}
