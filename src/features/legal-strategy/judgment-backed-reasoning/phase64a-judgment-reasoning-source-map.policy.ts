/**
 * Product Phase 64-A — Judgment Reasoning Source Map policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { RealTimeLegalSignalStatus } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import type { CounterArgumentCandidate } from "@/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.schema";
import type { CounterArgumentDraftParagraph } from "@/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.schema";
import type { EvidenceGapCandidate } from "@/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.schema";
import type { StrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import type {
  BuildJudgmentReasoningSourceMapInput,
  JudgmentReasoningArtifactSourceTrace,
  JudgmentReasoningSourceEntry,
  JudgmentReasoningSourceMap,
  JudgmentReasoningTargetKind,
  JudgmentReasoningUncertaintySignal,
} from "./phase64a-judgment-reasoning-source-map.schema";
import {
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_SCHEMA_MARKER,
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERSION,
  judgmentReasoningSourceMapBoundariesSchema,
  judgmentReasoningSourceMapSchema,
} from "./phase64a-judgment-reasoning-source-map.schema";

export const PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_POLICY_MARKER =
  "phase64a-judgment-reasoning-source-map-policy" as const;

export const PHASE64A_ONE_LINE_STANDARD =
  "Phase 64-A는 StrategyCandidate, EvidenceGapCandidate, CounterArgumentCandidate, CounterArgumentDraftParagraph가 참조한 공부호 항목·판례·법령·승인된 실시간 signal·sourceTrace를 JudgmentReasoningSourceMap으로 구조화하여 변호사가 근거를 추적할 수 있게 한다." as const;

export const PHASE64A_BOUNDARY_MARKERS = [
  "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE",
  "NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE",
  "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_REASONING_VIEW",
  "NO_CASE_OUTCOME_PREDICTION_AS_CERTAINTY",
  "NO_CLIENT_VISIBLE_JUDGMENT_REASONING_BY_DEFAULT",
  "UNCERTAINTY_SIGNAL_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type JudgmentReasoningBoundaryMarker = (typeof PHASE64A_BOUNDARY_MARKERS)[number];

export const PHASE64A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase64a" as const;

export const PHASE64A_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_VERIFY_SCRIPT =
  "verify:aibeopchin-counter-argument-draft-engine-rc" as const;

const CANONICAL_SOURCE_REQUIRED_KINDS = new Set([
  "GONGBUHO_JUDGMENT_LINK",
  "APPROVED_REAL_TIME_SIGNAL",
  "STATUTE_REF",
]);

const OUTCOME_CERTAINTY_PATTERNS = [
  /승소\s*(확실|100%|반드시|틀림없)/i,
  /패소\s*(확실|100%|반드시|틀림없)/i,
  /100%\s*(승|패)/i,
  /반드시\s*(이긴|진)다/i,
  /case\s+outcome\s+is\s+certain/i,
  /guaranteed\s+(win|loss)/i,
] as const;

const DEFAULT_BOUNDARIES = judgmentReasoningSourceMapBoundariesSchema.parse({
  noReasoningViewWithoutSourceTrace: true,
  noJudgmentUseWithoutCanonicalSource: true,
  noUnapprovedRealTimeSignalInReasoningView: true,
  noCaseOutcomePredictionAsCertainty: true,
  noClientVisibleJudgmentReasoningByDefault: true,
  uncertaintySignalRequired: true,
  judgmentReasoningAuditRequired: true,
  controlTowerBrainVerifyRequired: true,
});

function isApprovedRealTimeSignalStatus(status?: RealTimeLegalSignalStatus) {
  return status === "APPROVED_FOR_AI_USE";
}

export function detectOutcomePredictionAsCertainty(text: string): {
  detected: boolean;
  blockedBy?: typeof PHASE64A_BOUNDARY_MARKERS[number];
} {
  const normalized = text.trim();
  if (!normalized) {
    return { detected: false };
  }
  for (const pattern of OUTCOME_CERTAINTY_PATTERNS) {
    if (pattern.test(normalized)) {
      return { detected: true, blockedBy: "NO_CASE_OUTCOME_PREDICTION_AS_CERTAINTY" };
    }
  }
  return { detected: false };
}

export function evaluateJudgmentReasoningArtifactSourceTrace(
  trace: JudgmentReasoningArtifactSourceTrace,
): { allowed: boolean; blockedBy?: JudgmentReasoningBoundaryMarker } {
  if (!trace.traceId.trim() || !trace.sourceRef.trim()) {
    return { allowed: false, blockedBy: "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE" };
  }
  if (!trace.reasoningContextAuditRef.trim()) {
    return { allowed: false, blockedBy: "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE" };
  }
  return { allowed: true };
}

export function evaluateJudgmentReasoningSourceEntry(entry: JudgmentReasoningSourceEntry): {
  allowed: boolean;
  blockedBy?: JudgmentReasoningBoundaryMarker;
} {
  if (!entry.linkedSourceTraceIds.length) {
    return { allowed: false, blockedBy: "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE" };
  }

  if (CANONICAL_SOURCE_REQUIRED_KINDS.has(entry.sourceKind)) {
    if (!entry.canonicalSourceRef?.trim()) {
      return { allowed: false, blockedBy: "NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE" };
    }
  }

  if (entry.realTimeSignalStatus && !isApprovedRealTimeSignalStatus(entry.realTimeSignalStatus)) {
    return {
      allowed: false,
      blockedBy: "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_REASONING_VIEW",
    };
  }

  if (entry.sourceKind === "APPROVED_REAL_TIME_SIGNAL") {
    if (!isApprovedRealTimeSignalStatus(entry.realTimeSignalStatus)) {
      return {
        allowed: false,
        blockedBy: "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_REASONING_VIEW",
      };
    }
  }

  const certaintyInSummary = detectOutcomePredictionAsCertainty(
    `${entry.summary} ${entry.relevanceNote} ${entry.uncertaintyNote ?? ""}`,
  );
  if (certaintyInSummary.detected) {
    return {
      allowed: false,
      blockedBy: certaintyInSummary.blockedBy,
    };
  }

  return { allowed: true };
}

export function canExposeJudgmentReasoningToClient(input: {
  clientVisibleAllowed: boolean;
  lawyerReviewApproved: boolean;
}) {
  if (input.clientVisibleAllowed && input.lawyerReviewApproved) {
    return { allowed: true as const, blockedBy: null };
  }
  return {
    allowed: false,
    blockedBy: "NO_CLIENT_VISIBLE_JUDGMENT_REASONING_BY_DEFAULT" as const,
  };
}

export function canRenderJudgmentReasoningView(input: {
  artifactSourceTrace: JudgmentReasoningArtifactSourceTrace[];
  sourceEntries: JudgmentReasoningSourceEntry[];
  uncertaintySignals: JudgmentReasoningUncertaintySignal[];
  auditRef: string;
}) {
  if (!input.auditRef.trim()) {
    return { allowed: false, blockedBy: "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE" as const };
  }
  if (!input.artifactSourceTrace.length) {
    return { allowed: false, blockedBy: "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE" as const };
  }
  if (!input.sourceEntries.length) {
    return { allowed: false, blockedBy: "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE" as const };
  }
  if (!input.uncertaintySignals.length) {
    return { allowed: false, blockedBy: "UNCERTAINTY_SIGNAL_REQUIRED" as const };
  }

  for (const trace of input.artifactSourceTrace) {
    const traceGate = evaluateJudgmentReasoningArtifactSourceTrace(trace);
    if (!traceGate.allowed) {
      return { allowed: false, blockedBy: traceGate.blockedBy ?? "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE" };
    }
  }

  for (const entry of input.sourceEntries) {
    const entryGate = evaluateJudgmentReasoningSourceEntry(entry);
    if (!entryGate.allowed) {
      return { allowed: false, blockedBy: entryGate.blockedBy ?? "NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE" };
    }
  }

  return { allowed: true as const, blockedBy: null };
}

function mapArtifactTrace(
  trace: JudgmentReasoningArtifactSourceTrace,
  index: number,
): JudgmentReasoningSourceEntry {
  return {
    entryId: `jrs-artifact-${trace.traceId}-${index}`,
    sourceKind: "ARTIFACT_SOURCE_TRACE",
    sourceRef: trace.sourceRef,
    summary: `Artifact source trace ${trace.sourceKind}`,
    relevanceNote: `Grounds ${trace.sourceRef} via ${trace.sourceKind}`,
    favorability: "NEUTRAL",
    linkedSourceTraceIds: [trace.traceId],
  };
}

function buildJudgmentLinkEntries(
  reasoningContext: GongbuhoReasoningContextBundle,
): JudgmentReasoningSourceEntry[] {
  return reasoningContext.memoryGrounds.judgmentLinks.map((link) => ({
    entryId: `jrs-judgment-${link.referenceId}`,
    sourceKind: "GONGBUHO_JUDGMENT_LINK" as const,
    sourceRef: link.judgmentRef,
    summary: link.relevanceSummary,
    relevanceNote: `Judgment link ${link.referenceId} from Gongbuho memory grounds`,
    canonicalSourceRef: link.canonicalSourceRef,
    favorability: "UNCERTAIN" as const,
    realTimeSignalStatus: link.realTimeSignalStatus,
    linkedSourceTraceIds: link.sourceTraceIds,
    uncertaintyNote: link.canonicalSourceRef
      ? undefined
      : "Judgment link lacks canonical source reference",
  }));
}

function buildApprovedSignalEntries(
  reasoningContext: GongbuhoReasoningContextBundle,
): JudgmentReasoningSourceEntry[] {
  const approvedSignalStatuses = new Set<NonNullable<JudgmentReasoningSourceEntry["realTimeSignalStatus"]>>([
    "LAWYER_REVIEW_REQUIRED",
    "FETCHED",
    "NORMALIZED",
    "RELEVANCE_SCORED",
    "CONFLICT_CHECKED",
    "APPROVED_FOR_AI_USE",
  ]);
  const signals = [
    ...reasoningContext.approvedRealTimeSignals.statutes,
    ...reasoningContext.approvedRealTimeSignals.judgments,
    ...reasoningContext.approvedRealTimeSignals.operationalSignals,
  ].filter((signal) =>
    approvedSignalStatuses.has(
      signal.status as NonNullable<JudgmentReasoningSourceEntry["realTimeSignalStatus"]>,
    ),
  );

  return signals.map((signal) => ({
    entryId: `jrs-signal-${signal.signalId}`,
    sourceKind: "APPROVED_REAL_TIME_SIGNAL" as const,
    sourceRef: signal.signalId,
    summary: signal.summaryPointer,
    relevanceNote: `Approved real-time signal (${signal.signalKind})`,
    canonicalSourceRef: signal.sourceTrace.canonicalSourceRef,
    favorability: "UNCERTAIN" as const,
    realTimeSignalStatus:
      signal.status as NonNullable<JudgmentReasoningSourceEntry["realTimeSignalStatus"]>,
    linkedSourceTraceIds: [signal.sourceTrace.traceId],
  }));
}

function buildConfirmedFactEntries(
  reasoningContext: GongbuhoReasoningContextBundle,
): JudgmentReasoningSourceEntry[] {
  return reasoningContext.memoryGrounds.confirmedFacts.map((fact) => ({
    entryId: `jrs-fact-${fact.factId}`,
    sourceKind: "GONGBUHO_CONFIRMED_FACT" as const,
    sourceRef: fact.factId,
    summary: fact.summary,
    relevanceNote: `Confirmed fact ${fact.label}`,
    favorability: "NEUTRAL" as const,
    linkedSourceTraceIds: fact.sourceTraceIds,
  }));
}

function buildEvidenceMapEntries(
  reasoningContext: GongbuhoReasoningContextBundle,
): JudgmentReasoningSourceEntry[] {
  return reasoningContext.memoryGrounds.evidenceMap.map((link) => ({
    entryId: `jrs-evidence-${link.linkId}`,
    sourceKind: "GONGBUHO_EVIDENCE_MAP" as const,
    sourceRef: link.evidenceRef,
    summary: `Evidence ${link.evidenceRef} supports claim ${link.claimRef}`,
    relevanceNote: `Support strength ${link.supportStrength}`,
    favorability: "NEUTRAL" as const,
    linkedSourceTraceIds: link.sourceTraceIds,
  }));
}

function buildCounterArgumentBasisEntries(
  candidate: CounterArgumentCandidate,
): JudgmentReasoningSourceEntry[] {
  return candidate.decomposition.gongbuhoBasisRefs.map((basis) => {
    const sourceKind =
      basis.basisKind === "JUDGMENT_LINK"
        ? ("GONGBUHO_JUDGMENT_LINK" as const)
        : basis.basisKind === "CONFIRMED_FACT"
          ? ("GONGBUHO_CONFIRMED_FACT" as const)
          : basis.basisKind === "EVIDENCE_MAP"
            ? ("GONGBUHO_EVIDENCE_MAP" as const)
            : ("REUSABLE_LEGAL_PATTERN" as const);

    return {
      entryId: `jrs-basis-${basis.basisId}`,
      sourceKind,
      sourceRef: basis.ref,
      summary: basis.summary,
      relevanceNote: `Counter-argument basis ${basis.basisKind}`,
      favorability: "UNCERTAIN" as const,
      linkedSourceTraceIds: candidate.sourceTrace.map((trace) => trace.traceId),
      // JUDGMENT_LINK의 경우 실제 법원 판례 번호(canonicalSourceRef)를 우선 사용;
      // 없으면 undefined — 64-A NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE 경계가 uncertainty signal로 처리
      canonicalSourceRef: basis.basisKind === "JUDGMENT_LINK" ? basis.canonicalSourceRef : undefined,
    };
  });
}

function deriveUncertaintySignals(input: {
  sourceEntries: JudgmentReasoningSourceEntry[];
  reasoningContext: GongbuhoReasoningContextBundle;
  targetKind: JudgmentReasoningTargetKind;
}): JudgmentReasoningUncertaintySignal[] {
  const signals: JudgmentReasoningUncertaintySignal[] = [];

  signals.push({
    signalId: "jrs-unc-lawyer-review",
    kind: "LAWYER_REVIEW_REQUIRED",
    summary: "Judgment reasoning view requires lawyer review before client exposure or final use.",
    severity: "MEDIUM",
    linkedEntryIds: [],
  });

  for (const entry of input.sourceEntries) {
    if (
      entry.sourceKind === "GONGBUHO_JUDGMENT_LINK" &&
      !entry.canonicalSourceRef?.trim()
    ) {
      signals.push({
        signalId: `jrs-unc-canonical-${entry.entryId}`,
        kind: "INCOMPLETE_CANONICAL_SOURCE",
        summary: `Judgment entry ${entry.sourceRef} lacks canonical source reference.`,
        severity: "HIGH",
        linkedEntryIds: [entry.entryId],
      });
    }
  }

  if (input.reasoningContext.excludedItems.unapprovedSignalCount > 0) {
    signals.push({
      signalId: "jrs-unc-unapproved-signals",
      kind: "EXCLUDED_UNAPPROVED_SIGNAL",
      summary: `${input.reasoningContext.excludedItems.unapprovedSignalCount} unapproved real-time signals excluded from reasoning view.`,
      severity: "MEDIUM",
      linkedEntryIds: [],
    });
  }

  if (input.reasoningContext.memoryGrounds.confirmedFacts.some((fact) => fact.reviewStatus !== "LAWYER_CONFIRMED")) {
    signals.push({
      signalId: "jrs-unc-artifact-review",
      kind: "ARTIFACT_REVIEW_PENDING",
      summary: "Some memory grounds are not lawyer-confirmed.",
      severity: "LOW",
      linkedEntryIds: [],
    });
  }

  return signals;
}

function assertTargetArtifactMatches(input: BuildJudgmentReasoningSourceMapInput) {
  const checks: Record<JudgmentReasoningTargetKind, () => unknown> = {
    STRATEGY_CANDIDATE: () => input.strategyCandidate,
    EVIDENCE_GAP_CANDIDATE: () => input.evidenceGapCandidate,
    COUNTER_ARGUMENT_CANDIDATE: () => input.counterArgumentCandidate,
    DRAFT_PARAGRAPH: () => input.draftParagraph,
  };

  const artifact = checks[input.targetKind]();
  if (!artifact) {
    throw new ValidationError("NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE");
  }

  const scoped = artifact as { caseId: string; tenantId: string };
  if (scoped.caseId !== input.caseId || scoped.tenantId !== input.tenantId) {
    throw new ValidationError("NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE");
  }
}

export function buildJudgmentReasoningSourceMapFromStrategyCandidate(input: {
  mapId: string;
  strategyCandidate: StrategyCandidate;
  reasoningContext: GongbuhoReasoningContextBundle;
  auditRef: string;
  createdAt?: string;
}): JudgmentReasoningSourceMap {
  return buildJudgmentReasoningSourceMap({
    mapId: input.mapId,
    caseId: input.strategyCandidate.caseId,
    tenantId: input.strategyCandidate.tenantId,
    targetKind: "STRATEGY_CANDIDATE",
    targetRef: input.strategyCandidate.candidateId,
    reasoningContextAuditRef: input.strategyCandidate.reasoningContextAuditRef,
    reasoningContext: input.reasoningContext,
    strategyCandidate: input.strategyCandidate,
    artifactSourceTrace: input.strategyCandidate.sourceTrace.map((trace) => ({
      traceId: trace.traceId,
      sourceKind: trace.sourceKind,
      sourceRef: trace.sourceRef,
      reasoningContextAuditRef: trace.reasoningContextAuditRef,
      capturedAt: trace.capturedAt,
    })),
    auditRef: input.auditRef,
  });
}

export function buildJudgmentReasoningSourceMapFromEvidenceGapCandidate(input: {
  mapId: string;
  evidenceGapCandidate: EvidenceGapCandidate;
  reasoningContext: GongbuhoReasoningContextBundle;
  auditRef: string;
}): JudgmentReasoningSourceMap {
  return buildJudgmentReasoningSourceMap({
    mapId: input.mapId,
    caseId: input.evidenceGapCandidate.caseId,
    tenantId: input.evidenceGapCandidate.tenantId,
    targetKind: "EVIDENCE_GAP_CANDIDATE",
    targetRef: input.evidenceGapCandidate.gapCandidateId,
    reasoningContextAuditRef: input.evidenceGapCandidate.reasoningContextAuditRef,
    reasoningContext: input.reasoningContext,
    evidenceGapCandidate: input.evidenceGapCandidate,
    artifactSourceTrace: input.evidenceGapCandidate.sourceTrace.map((trace) => ({
      traceId: trace.traceId,
      sourceKind: trace.sourceKind,
      sourceRef: trace.sourceRef,
      reasoningContextAuditRef: trace.reasoningContextAuditRef,
      capturedAt: trace.capturedAt,
    })),
    auditRef: input.auditRef,
  });
}

export function buildJudgmentReasoningSourceMapFromCounterArgumentCandidate(input: {
  mapId: string;
  counterArgumentCandidate: CounterArgumentCandidate;
  reasoningContext: GongbuhoReasoningContextBundle;
  auditRef: string;
}): JudgmentReasoningSourceMap {
  return buildJudgmentReasoningSourceMap({
    mapId: input.mapId,
    caseId: input.counterArgumentCandidate.caseId,
    tenantId: input.counterArgumentCandidate.tenantId,
    targetKind: "COUNTER_ARGUMENT_CANDIDATE",
    targetRef: input.counterArgumentCandidate.counterArgumentCandidateId,
    reasoningContextAuditRef: input.counterArgumentCandidate.reasoningContextAuditRef,
    reasoningContext: input.reasoningContext,
    counterArgumentCandidate: input.counterArgumentCandidate,
    artifactSourceTrace: input.counterArgumentCandidate.sourceTrace.map((trace) => ({
      traceId: trace.traceId,
      sourceKind: trace.sourceKind,
      sourceRef: trace.sourceRef,
      reasoningContextAuditRef: trace.reasoningContextAuditRef,
      capturedAt: trace.capturedAt,
    })),
    auditRef: input.auditRef,
  });
}

export function buildJudgmentReasoningSourceMapFromDraftParagraph(input: {
  mapId: string;
  draftParagraph: CounterArgumentDraftParagraph;
  reasoningContext: GongbuhoReasoningContextBundle;
  auditRef: string;
}): JudgmentReasoningSourceMap {
  return buildJudgmentReasoningSourceMap({
    mapId: input.mapId,
    caseId: input.draftParagraph.caseId,
    tenantId: input.draftParagraph.tenantId,
    targetKind: "DRAFT_PARAGRAPH",
    targetRef: input.draftParagraph.paragraphId,
    reasoningContextAuditRef: input.draftParagraph.reasoningContextAuditRef,
    reasoningContext: input.reasoningContext,
    draftParagraph: input.draftParagraph,
    artifactSourceTrace: input.draftParagraph.sourceTrace.map((trace) => ({
      traceId: trace.traceId,
      sourceKind: trace.sourceKind,
      sourceRef: trace.sourceRef,
      reasoningContextAuditRef: trace.reasoningContextAuditRef,
      capturedAt: trace.capturedAt,
    })),
    auditRef: input.auditRef,
  });
}

export function buildJudgmentReasoningSourceMap(
  input: BuildJudgmentReasoningSourceMapInput,
): JudgmentReasoningSourceMap {
  if (!input.auditRef.trim()) {
    throw new ValidationError("NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE");
  }
  if (!input.artifactSourceTrace.length) {
    throw new ValidationError("NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE");
  }

  assertTargetArtifactMatches(input);

  for (const trace of input.artifactSourceTrace) {
    const traceGate = evaluateJudgmentReasoningArtifactSourceTrace(trace);
    if (!traceGate.allowed) {
      throw new ValidationError(traceGate.blockedBy ?? "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE");
    }
  }

  const artifactEntries = input.artifactSourceTrace.map(mapArtifactTrace);
  const contextEntries = [
    ...buildConfirmedFactEntries(input.reasoningContext),
    ...buildEvidenceMapEntries(input.reasoningContext),
    ...buildJudgmentLinkEntries(input.reasoningContext),
    ...buildApprovedSignalEntries(input.reasoningContext),
  ];

  const basisEntries =
    input.counterArgumentCandidate != null
      ? buildCounterArgumentBasisEntries(input.counterArgumentCandidate)
      : [];

  const sourceEntries = [...artifactEntries, ...contextEntries, ...basisEntries];

  for (const entry of sourceEntries) {
    const entryGate = evaluateJudgmentReasoningSourceEntry(entry);
    if (!entryGate.allowed) {
      throw new ValidationError(entryGate.blockedBy ?? "NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE");
    }
  }

  const uncertaintySignals = deriveUncertaintySignals({
    sourceEntries,
    reasoningContext: input.reasoningContext,
    targetKind: input.targetKind,
  });

  if (!uncertaintySignals.length) {
    throw new ValidationError("UNCERTAINTY_SIGNAL_REQUIRED");
  }

  const renderGate = canRenderJudgmentReasoningView({
    artifactSourceTrace: input.artifactSourceTrace,
    sourceEntries,
    uncertaintySignals,
    auditRef: input.auditRef,
  });
  if (!renderGate.allowed) {
    throw new ValidationError(renderGate.blockedBy ?? "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE");
  }

  return judgmentReasoningSourceMapSchema.parse({
    marker: PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_SCHEMA_MARKER,
    version: PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERSION,
    mapId: input.mapId,
    caseId: input.caseId,
    tenantId: input.tenantId,
    targetKind: input.targetKind,
    targetRef: input.targetRef,
    reasoningContextAuditRef: input.reasoningContextAuditRef,
    reasoningContextBundleVersion: "59-C.1",
    sourceEntries,
    artifactSourceTrace: input.artifactSourceTrace,
    uncertaintySignals,
    clientVisibleAllowed: false,
    lawyerReviewRequiredForClientVisibility: true,
    boundaries: DEFAULT_BOUNDARIES,
    auditRef: input.auditRef,
    counterArgumentDraftEngineRcVerifyScript: PHASE64A_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_VERIFY_SCRIPT,
    phase64AVerifyScript: PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE64A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    createdAt: new Date().toISOString(),
  });
}
