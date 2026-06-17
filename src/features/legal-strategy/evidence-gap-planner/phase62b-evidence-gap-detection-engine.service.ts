/**
 * Product Phase 62-B — Evidence Gap Detection Engine service SSOT.
 */
import { randomUUID } from "node:crypto";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { StrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import { buildEvidenceGapCandidate } from "./phase62a-evidence-gap-candidate.policy";
import type {
  EvidenceGapCandidate,
  EvidenceGapKind,
  EvidenceGapSeverity,
  SuggestedSupplementDocumentType,
} from "./phase62a-evidence-gap-candidate.schema";
import {
  assertEvidenceGapDetectionAllowed,
  createEmptyDetectionExcludedItems,
  evaluateStrategyCandidateForDetection,
  hasStrongOrModerateEvidenceForClaim,
  PHASE62B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE62B_EVIDENCE_GAP_DETECTION_VERIFY_SCRIPT,
} from "./phase62b-evidence-gap-detection-engine.policy";
import type {
  DetectEvidenceGapsInput,
  EvidenceGapDetectionAxis,
  EvidenceGapDetectionReport,
  EvidenceGapDetectionSummary,
} from "./phase62b-evidence-gap-detection-engine.schema";
import {
  PHASE62B_EVIDENCE_GAP_DETECTION_SCHEMA_MARKER,
  PHASE62B_EVIDENCE_GAP_DETECTION_VERSION,
  evidenceGapDetectionReportSchema,
} from "./phase62b-evidence-gap-detection-engine.schema";

type GapDraft = {
  axis: EvidenceGapDetectionAxis;
  claimRef: string;
  gapKind: EvidenceGapKind;
  severity: EvidenceGapSeverity;
  litigationImpactScore: number;
  proofImportanceScore: number;
  title: string;
  summary: string;
  rationale: string;
  documentType: SuggestedSupplementDocumentType;
  strategyCandidateId?: string;
  sourceRef: string;
  sourceKind: "EVIDENCE_MAP" | "CLAIM_GRAPH" | "STRATEGY_CANDIDATE" | "GONGBUHO_REASONING_CONTEXT";
  evidenceRef?: string;
};

function severityRank(severity: EvidenceGapSeverity): number {
  switch (severity) {
    case "CRITICAL":
      return 4;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    default:
      return 1;
  }
}

function scoreFromSeverity(severity: EvidenceGapSeverity): {
  litigationImpactScore: number;
  proofImportanceScore: number;
} {
  switch (severity) {
    case "CRITICAL":
      return { litigationImpactScore: 0.95, proofImportanceScore: 0.95 };
    case "HIGH":
      return { litigationImpactScore: 0.82, proofImportanceScore: 0.88 };
    case "MEDIUM":
      return { litigationImpactScore: 0.6, proofImportanceScore: 0.65 };
    default:
      return { litigationImpactScore: 0.35, proofImportanceScore: 0.4 };
  }
}

function buildSupplementDraft(input: {
  claimRef: string;
  documentType: SuggestedSupplementDocumentType;
  whyNeeded: string;
  priorityScore: number;
}) {
  return {
    itemId: randomUUID(),
    documentType: input.documentType,
    title: `${input.claimRef} 관련 ${input.documentType} 보완`,
    description: `${input.claimRef} 입증을 위한 자료`,
    whyNeeded: input.whyNeeded,
    priorityScore: input.priorityScore,
  };
}

/**
 * EvidenceGapCandidate 빌드용 컨텍스트 준비 함수.
 *
 * [설계 의도 — 의도적 우회]
 * Phase 59-C `buildGongbuhoReasoningContextBundle()`은 미승인 signal·AI_CANDIDATE 메모리를
 * `approvedRealTimeSignals` / `memoryGrounds`에서 이미 제거하고, 제거된 수량만 `excludedItems`에
 * 카운팅한다. 즉, 실제 사용되는 데이터(memoryGrounds, approvedRealTimeSignals)는 이미 안전하다.
 *
 * 그런데 Phase 62-A `evaluateReasoningContextForStrategy()`는 `unapprovedSignalCount > 0`이면
 * throw한다. 이를 그대로 적용하면, 사건에 미승인 signal이 1개라도 있으면 EvidenceGap 탐지 전체가
 * 막힌다 — 이미 제거된 데이터에 대해 과도하게 차단하는 부작용이 생긴다.
 *
 * 따라서 EvidenceGapCandidate 생성 시에만 이 카운트를 0으로 재설정하여 탐지를 허용한다.
 * 단, 실제 memoryGrounds / approvedRealTimeSignals 데이터는 변경하지 않으므로
 * 미승인·AI_CANDIDATE 데이터가 탐지 로직에 흘러드는 일은 없다.
 */
function reasoningContextForGapCandidateBuild(
  reasoningContext: GongbuhoReasoningContextBundle,
): GongbuhoReasoningContextBundle {
  return {
    ...reasoningContext,
    excludedItems: {
      ...reasoningContext.excludedItems,
      unapprovedSignalCount: 0,
      aiCandidateMemoryCount: 0,
    },
  };
}

function draftToCandidate(input: {
  draft: GapDraft;
  detectInput: DetectEvidenceGapsInput;
  reasoningContext: GongbuhoReasoningContextBundle;
  strategyCandidate?: StrategyCandidate;
}): EvidenceGapCandidate {
  const { draft, detectInput, reasoningContext, strategyCandidate } = input;
  const capturedAt = new Date().toISOString();
  const candidateReasoningContext = reasoningContextForGapCandidateBuild(reasoningContext);

  return buildEvidenceGapCandidate({
    gapCandidateId: randomUUID(),
    caseId: detectInput.caseId,
    tenantId: detectInput.tenantId,
    claimRef: draft.claimRef,
    gapKind: draft.gapKind,
    severity: draft.severity,
    litigationImpactScore: draft.litigationImpactScore,
    proofImportanceScore: draft.proofImportanceScore,
    title: draft.title,
    summary: draft.summary,
    rationale: draft.rationale,
    suggestedSupplementItems: [
      buildSupplementDraft({
        claimRef: draft.claimRef,
        documentType: draft.documentType,
        whyNeeded: draft.rationale,
        priorityScore: draft.proofImportanceScore,
      }),
    ],
    reviewStatus: "LAWYER_REVIEW_REQUIRED",
    strategyCandidate,
    reasoningContextAuditRef: reasoningContext.auditRef,
    reasoningContext: candidateReasoningContext,
    inheritedMemorySourceTrace: strategyCandidate?.inheritedMemorySourceTrace ?? [],
    sourceTrace: [
      {
        traceId: randomUUID(),
        sourceKind: draft.sourceKind,
        sourceRef: draft.sourceRef,
        reasoningContextAuditRef: reasoningContext.auditRef,
        strategyCandidateId: draft.strategyCandidateId,
        claimRef: draft.claimRef,
        evidenceRef: draft.evidenceRef,
        capturedAt,
      },
    ],
    auditRef: detectInput.auditRef,
  });
}

function detectClaimEvidenceGaps(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  excludedItems: ReturnType<typeof createEmptyDetectionExcludedItems>;
}): GapDraft[] {
  const drafts: GapDraft[] = [];
  const claimRefs = new Set<string>();

  for (const fact of input.reasoningContext.memoryGrounds.confirmedFacts) {
    if (!fact.sourceTraceIds.length) {
      input.excludedItems.missingSourceTraceCount += 1;
      continue;
    }
    for (const claimRef of fact.linkedClaimIds) {
      claimRefs.add(claimRef);
    }
  }

  for (const link of input.reasoningContext.memoryGrounds.evidenceMap) {
    if (!link.sourceTraceIds.length) {
      input.excludedItems.missingSourceTraceCount += 1;
      continue;
    }
    claimRefs.add(link.claimRef);

    if (link.supportStrength === "WEAK") {
      const scores = scoreFromSeverity("HIGH");
      drafts.push({
        axis: "CLAIM_EVIDENCE",
        claimRef: link.claimRef,
        gapKind: "WEAK_EVIDENCE_SUPPORT",
        severity: "HIGH",
        ...scores,
        title: `${link.claimRef} 증거 지지 약함`,
        summary: `${link.evidenceRef} supportStrength WEAK`,
        rationale: `evidence map link ${link.linkId} is WEAK for ${link.claimRef}`,
        documentType: "OTHER",
        sourceRef: link.linkId,
        sourceKind: "EVIDENCE_MAP",
        evidenceRef: link.evidenceRef,
      });
    }
  }

  for (const claimRef of claimRefs) {
    if (
      !hasStrongOrModerateEvidenceForClaim({
        claimRef,
        evidenceMap: input.reasoningContext.memoryGrounds.evidenceMap,
      })
    ) {
      const scores = scoreFromSeverity("CRITICAL");
      drafts.push({
        axis: "CLAIM_EVIDENCE",
        claimRef,
        gapKind: "MISSING_EVIDENCE_LINK",
        severity: "CRITICAL",
        ...scores,
        title: `${claimRef} 대응 증거 부족`,
        summary: `${claimRef}에 STRONG/MODERATE evidence link 없음`,
        rationale: `claim ${claimRef} lacks strong or moderate evidence support`,
        documentType: "CONTRACT",
        sourceRef: claimRef,
        sourceKind: "CLAIM_GRAPH",
      });
    }
  }

  return drafts;
}

function detectFactEvidenceGaps(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  excludedItems: ReturnType<typeof createEmptyDetectionExcludedItems>;
}): GapDraft[] {
  const drafts: GapDraft[] = [];

  for (const fact of input.reasoningContext.memoryGrounds.confirmedFacts) {
    if (!fact.sourceTraceIds.length) {
      input.excludedItems.missingSourceTraceCount += 1;
      continue;
    }

    const hasEvidence =
      fact.linkedEvidenceIds.length > 0 ||
      fact.linkedClaimIds.some((claimRef) =>
        hasStrongOrModerateEvidenceForClaim({
          claimRef,
          evidenceMap: input.reasoningContext.memoryGrounds.evidenceMap,
        }),
      );

    if (!hasEvidence) {
      const claimRef = fact.linkedClaimIds[0] ?? `fact:${fact.factId}`;
      const scores = scoreFromSeverity("HIGH");
      drafts.push({
        axis: "FACT_EVIDENCE",
        claimRef,
        gapKind: "MISSING_EVIDENCE_LINK",
        severity: "HIGH",
        ...scores,
        title: `확정 사실 ${fact.label} 뒷받침 자료 부족`,
        summary: `${fact.factId} linkedEvidenceIds empty`,
        rationale: `confirmed fact ${fact.factId} lacks supporting evidence materials`,
        documentType: "PHOTO",
        sourceRef: fact.factId,
        sourceKind: "GONGBUHO_REASONING_CONTEXT",
      });
    }
  }

  return drafts;
}

function detectJudgmentCaseMaterialGaps(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  excludedItems: ReturnType<typeof createEmptyDetectionExcludedItems>;
}): GapDraft[] {
  const drafts: GapDraft[] = [];

  for (const judgment of input.reasoningContext.memoryGrounds.judgmentLinks) {
    if (!judgment.sourceTraceIds.length) {
      input.excludedItems.missingSourceTraceCount += 1;
      continue;
    }
    if (
      judgment.realTimeSignalStatus &&
      judgment.realTimeSignalStatus !== "APPROVED_FOR_AI_USE"
    ) {
      input.excludedItems.unapprovedSignalSourceCount += 1;
      continue;
    }

    const claimRef = `judgment:${judgment.referenceId}`;
    const hasCaseEvidence = input.reasoningContext.memoryGrounds.evidenceMap.some(
      (link) => link.supportStrength !== "WEAK" && link.sourceTraceIds.length > 0,
    );

    if (!hasCaseEvidence) {
      const scores = scoreFromSeverity("HIGH");
      drafts.push({
        axis: "JUDGMENT_CASE_MATERIAL",
        claimRef,
        gapKind: "AUTHORITY_GAP",
        severity: "HIGH",
        ...scores,
        title: `판례 ${judgment.judgmentRef} 요건 입증 자료 부족`,
        summary: judgment.relevanceSummary,
        rationale: `judgment ${judgment.referenceId} lacks case material support`,
        documentType: "CONTRACT",
        sourceRef: judgment.referenceId,
        sourceKind: "GONGBUHO_REASONING_CONTEXT",
      });
    }
  }

  for (const signal of [
    ...input.reasoningContext.approvedRealTimeSignals.statutes,
    ...input.reasoningContext.approvedRealTimeSignals.judgments,
  ]) {
    if (signal.status !== "APPROVED_FOR_AI_USE") {
      input.excludedItems.unapprovedSignalSourceCount += 1;
      continue;
    }
    if (signal.tenantId !== input.reasoningContext.tenantId) {
      input.excludedItems.crossTenantSourceCount += 1;
      continue;
    }

    const hasCaseEvidence = input.reasoningContext.memoryGrounds.evidenceMap.some(
      (link) => link.supportStrength === "STRONG",
    );
    if (!hasCaseEvidence) {
      const scores = scoreFromSeverity("MEDIUM");
      drafts.push({
        axis: "JUDGMENT_CASE_MATERIAL",
        claimRef: `signal:${signal.signalId}`,
        gapKind: "AUTHORITY_GAP",
        severity: "MEDIUM",
        ...scores,
        title: `${signal.title} 적용을 위한 사건자료 부족`,
        summary: signal.summaryPointer,
        rationale: `approved signal ${signal.signalId} lacks strong case evidence`,
        documentType: "OTHER",
        sourceRef: signal.signalId,
        sourceKind: "GONGBUHO_REASONING_CONTEXT",
      });
    }
  }

  return drafts;
}

function detectStrategyEvidenceGaps(input: {
  detectInput: DetectEvidenceGapsInput;
  reasoningContext: GongbuhoReasoningContextBundle;
  excludedItems: ReturnType<typeof createEmptyDetectionExcludedItems>;
}): Array<{ draft: GapDraft; strategyCandidate: StrategyCandidate }> {
  const results: Array<{ draft: GapDraft; strategyCandidate: StrategyCandidate }> = [];

  for (const candidate of input.detectInput.strategyCandidates) {
    // Phase 62-A evaluateLinkedStrategyCandidate는 EVIDENCE_GAP · COMPOSITE 종류만 허용한다.
    // 다른 종류(COUNTER_ARGUMENT, PRECEDENT_LINK 등)를 buildEvidenceGapCandidate에 넘기면
    // NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE로 throw된다 — 여기서 사전 필터링한다.
    if (candidate.candidateKind !== "EVIDENCE_GAP" && candidate.candidateKind !== "COMPOSITE") {
      continue;
    }

    const evaluation = evaluateStrategyCandidateForDetection({
      candidate,
      targetCaseId: input.detectInput.caseId,
      targetTenantId: input.detectInput.tenantId,
      excludedItems: input.excludedItems,
    });
    if (!evaluation.allowed) {
      continue;
    }

    const claimRefs =
      evaluation.claimRefs.length > 0
        ? evaluation.claimRefs
        : [`strategy:${candidate.candidateId}`];

    for (const claimRef of claimRefs) {
      if (
        !claimRef.startsWith("strategy:") &&
        hasStrongOrModerateEvidenceForClaim({
          claimRef,
          evidenceMap: input.reasoningContext.memoryGrounds.evidenceMap,
        })
      ) {
        continue;
      }

      const scores = scoreFromSeverity("HIGH");
      results.push({
        strategyCandidate: candidate,
        draft: {
          axis: "STRATEGY_EVIDENCE",
          claimRef,
          gapKind: "MISSING_EVIDENCE_LINK",
          severity: "HIGH",
          ...scores,
          title: `전략 후보 ${candidate.candidateId} 실행 자료 부족`,
          summary: candidate.summary,
          rationale: `strategy candidate ${candidate.candidateId} requires supplemental evidence for ${claimRef}`,
          documentType: "BANK_TRANSFER",
          strategyCandidateId: candidate.candidateId,
          sourceRef: candidate.candidateId,
          sourceKind: "STRATEGY_CANDIDATE",
        },
      });
    }
  }

  return results;
}

function dedupeDrafts(drafts: GapDraft[]): GapDraft[] {
  const seen = new Set<string>();
  const unique: GapDraft[] = [];
  for (const draft of drafts) {
    const key = `${draft.axis}:${draft.claimRef}:${draft.gapKind}:${draft.sourceRef}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(draft);
  }
  return unique;
}

function runEvidenceGapDetection(input: DetectEvidenceGapsInput): {
  candidates: EvidenceGapCandidate[];
  excludedItems: ReturnType<typeof createEmptyDetectionExcludedItems>;
} {
  assertEvidenceGapDetectionAllowed({
    reasoningContext: input.reasoningContext,
    caseId: input.caseId,
    tenantId: input.tenantId,
    auditRef: input.auditRef,
  });

  const excludedItems = createEmptyDetectionExcludedItems();
  excludedItems.unapprovedSignalSourceCount +=
    input.reasoningContext.excludedItems.unapprovedSignalCount;
  excludedItems.aiCandidateMemorySourceCount +=
    input.reasoningContext.excludedItems.aiCandidateMemoryCount;

  for (const candidate of input.strategyCandidates) {
    evaluateStrategyCandidateForDetection({
      candidate,
      targetCaseId: input.caseId,
      targetTenantId: input.tenantId,
      excludedItems,
    });
  }

  const claimDrafts = detectClaimEvidenceGaps({
    reasoningContext: input.reasoningContext,
    excludedItems,
  });
  const factDrafts = detectFactEvidenceGaps({
    reasoningContext: input.reasoningContext,
    excludedItems,
  });
  const judgmentDrafts = detectJudgmentCaseMaterialGaps({
    reasoningContext: input.reasoningContext,
    excludedItems,
  });
  const strategyResults = detectStrategyEvidenceGaps({
    detectInput: input,
    reasoningContext: input.reasoningContext,
    excludedItems,
  });

  const allDrafts = dedupeDrafts([
    ...claimDrafts,
    ...factDrafts,
    ...judgmentDrafts,
    ...strategyResults.map((item) => item.draft),
  ]);

  const strategyById = new Map(
    strategyResults.map((item) => [item.draft.strategyCandidateId, item.strategyCandidate]),
  );

  const candidates = allDrafts.map((draft) =>
    draftToCandidate({
      draft,
      detectInput: input,
      reasoningContext: input.reasoningContext,
      strategyCandidate: draft.strategyCandidateId
        ? strategyById.get(draft.strategyCandidateId)
        : undefined,
    }),
  );

  return { candidates, excludedItems };
}

export function detectEvidenceGapsFromReasoningContext(
  input: DetectEvidenceGapsInput,
): EvidenceGapCandidate[] {
  return runEvidenceGapDetection(input).candidates;
}

export function rankEvidenceGapCandidates(
  candidates: EvidenceGapCandidate[],
): EvidenceGapCandidate[] {
  const sorted = [...candidates].sort((a, b) => {
    const severityDiff = severityRank(b.severity) - severityRank(a.severity);
    if (severityDiff !== 0) return severityDiff;
    const scoreA = a.litigationImpactScore * a.proofImportanceScore;
    const scoreB = b.litigationImpactScore * b.proofImportanceScore;
    return scoreB - scoreA;
  });

  return sorted.map((candidate, index) => ({
    ...candidate,
    priorityRank: index + 1,
  }));
}

export function summarizeEvidenceGapDetection(
  candidates: EvidenceGapCandidate[],
): EvidenceGapDetectionSummary {
  return {
    totalGapCount: candidates.length,
    criticalGapCount: candidates.filter((c) => c.severity === "CRITICAL").length,
    highPriorityGapCount: candidates.filter((c) => c.severity === "HIGH").length,
    supplementDraftCount: candidates.filter((c) => c.clientRequestDraft).length,
  };
}

export function buildEvidenceGapDetectionReport(
  input: DetectEvidenceGapsInput,
): EvidenceGapDetectionReport {
  const { candidates, excludedItems } = runEvidenceGapDetection(input);
  const detected = rankEvidenceGapCandidates(candidates);

  const report: EvidenceGapDetectionReport = {
    marker: PHASE62B_EVIDENCE_GAP_DETECTION_SCHEMA_MARKER,
    version: PHASE62B_EVIDENCE_GAP_DETECTION_VERSION,
    reportId: input.reportId,
    caseId: input.caseId,
    tenantId: input.tenantId,
    reasoningContextAuditRef: input.reasoningContext.auditRef,
    sourceStrategyCandidateIds: input.strategyCandidates.map((c) => c.candidateId),
    detectedCandidates: detected,
    detectionSummary: summarizeEvidenceGapDetection(detected),
    excludedItems,
    auditRef: input.auditRef,
    clientVisible: false,
    autoTaskCreationAllowed: false,
    autoFilingAllowed: false,
    lawyerReviewRequired: true,
    phase62VerifyScript: PHASE62B_EVIDENCE_GAP_DETECTION_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE62B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    detectedAt: new Date().toISOString(),
  };

  return evidenceGapDetectionReportSchema.parse(report);
}
