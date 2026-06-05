/**
 * Product Phase 64-B — Judgment Reasoning View policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { RealTimeLegalSignalStatus } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import {
  canRenderJudgmentReasoningView,
  detectOutcomePredictionAsCertainty,
} from "./phase64a-judgment-reasoning-source-map.policy";
import type {
  JudgmentCaseFavorability,
  JudgmentReasoningSourceEntry,
  JudgmentReasoningSourceMap,
  JudgmentReasoningUncertaintySignal,
} from "./phase64a-judgment-reasoning-source-map.schema";
import type {
  BuildJudgmentReasoningViewInput,
  JudgmentFavorabilityBadge,
  JudgmentReasoningAuthorityBadge,
  JudgmentReasoningCard,
  JudgmentReasoningCardSourceTraceRef,
  JudgmentReasoningUncertaintyPanel,
  JudgmentReasoningView,
} from "./phase64b-judgment-reasoning-view.schema";
import {
  PHASE64B_JUDGMENT_REASONING_VIEW_SCHEMA_MARKER,
  PHASE64B_JUDGMENT_REASONING_VIEW_VERSION,
  judgmentReasoningViewBoundariesSchema,
  judgmentReasoningViewSchema,
} from "./phase64b-judgment-reasoning-view.schema";

export const PHASE64B_JUDGMENT_REASONING_VIEW_POLICY_MARKER =
  "phase64b-judgment-reasoning-view-policy" as const;

export const PHASE64B_ONE_LINE_STANDARD =
  "Phase 64-B는 64-A JudgmentReasoningSourceMap을 변호사 검토용 JudgmentReasoningView로 변환하여 근거별 카드, 판례 유리/불리/불확실성, sourceTrace, uncertainty panel을 한 화면에서 검토할 수 있게 한다." as const;

export const PHASE64B_BOUNDARY_MARKERS = [
  "NO_VIEW_WITHOUT_SOURCE_MAP",
  "NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE",
  "NO_HIDDEN_REASONING_SOURCE",
  "NO_CERTAIN_OUTCOME_LANGUAGE",
  "NO_CLIENT_VISIBLE_REASONING_VIEW_BY_DEFAULT",
  "NO_UNAPPROVED_SIGNAL_RENDERED_AS_AUTHORITY",
  "UNCERTAINTY_PANEL_REQUIRED",
  "LAWYER_REVIEW_REQUIRED_FOR_REASONING_VIEW_USE",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type JudgmentReasoningViewBoundaryMarker = (typeof PHASE64B_BOUNDARY_MARKERS)[number];

export const PHASE64B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE64B_JUDGMENT_REASONING_VIEW_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase64b" as const;

export const PHASE64B_PHASE64A_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase64a" as const;

const JUDGMENT_CARD_SOURCE_KINDS = new Set([
  "GONGBUHO_JUDGMENT_LINK",
  "APPROVED_REAL_TIME_SIGNAL",
  "STATUTE_REF",
]);

const DEFAULT_BOUNDARIES = judgmentReasoningViewBoundariesSchema.parse({
  noViewWithoutSourceMap: true,
  noViewWithoutCanonicalJudgmentSource: true,
  noHiddenReasoningSource: true,
  noCertainOutcomeLanguage: true,
  noClientVisibleReasoningViewByDefault: true,
  noUnapprovedSignalRenderedAsAuthority: true,
  uncertaintyPanelRequired: true,
  lawyerReviewRequiredForReasoningViewUse: true,
  controlTowerBrainVerifyRequired: true,
});

function isApprovedRealTimeSignalStatus(status?: RealTimeLegalSignalStatus) {
  return status === "APPROVED_FOR_AI_USE";
}

export function mapEntryFavorabilityToBadge(
  favorability: JudgmentCaseFavorability,
): JudgmentFavorabilityBadge {
  if (favorability === "FAVORABLE") return "FAVORABLE";
  if (favorability === "UNFAVORABLE") return "UNFAVORABLE";
  return "UNCERTAIN";
}

export function buildJudgmentFavorabilityBadge(input: {
  favorability: JudgmentCaseFavorability;
  sourceKind: JudgmentReasoningSourceEntry["sourceKind"];
}): JudgmentFavorabilityBadge {
  if (!JUDGMENT_CARD_SOURCE_KINDS.has(input.sourceKind)) {
    return "UNCERTAIN";
  }
  return mapEntryFavorabilityToBadge(input.favorability);
}

export function computeAggregateFavorabilityBadge(
  cards: JudgmentReasoningCard[],
): JudgmentFavorabilityBadge {
  const judgmentBadges = cards
    .filter((card) => JUDGMENT_CARD_SOURCE_KINDS.has(card.sourceKind))
    .map((card) => card.favorabilityBadge)
    .filter((badge) => badge !== "UNCERTAIN");

  if (!judgmentBadges.length) {
    return "UNCERTAIN";
  }

  const unique = new Set(judgmentBadges);
  if (unique.has("FAVORABLE") && unique.has("UNFAVORABLE")) {
    return "MIXED";
  }
  if (unique.size === 1) {
    return Array.from(unique)[0] ?? "UNCERTAIN";
  }
  return "UNCERTAIN";
}

function resolveAuthorityBadge(entry: JudgmentReasoningSourceEntry): JudgmentReasoningAuthorityBadge {
  if (entry.sourceKind === "APPROVED_REAL_TIME_SIGNAL") {
    return isApprovedRealTimeSignalStatus(entry.realTimeSignalStatus)
      ? "APPROVED_REAL_TIME_SIGNAL"
      : "NONE";
  }

  if (
    entry.sourceKind === "GONGBUHO_CONFIRMED_FACT" ||
    entry.sourceKind === "GONGBUHO_JUDGMENT_LINK" ||
    entry.sourceKind === "GONGBUHO_EVIDENCE_MAP"
  ) {
    return "GONGBUHO_CONFIRMED";
  }

  return "NONE";
}

function resolveSourceTraceRefs(
  entry: JudgmentReasoningSourceEntry,
  sourceMap: JudgmentReasoningSourceMap,
): JudgmentReasoningCardSourceTraceRef[] {
  const traceById = new Map(
    sourceMap.artifactSourceTrace.map((trace) => [trace.traceId, trace] as const),
  );

  return entry.linkedSourceTraceIds.map((traceId) => {
    const artifactTrace = traceById.get(traceId);
    if (artifactTrace) {
      return {
        traceId: artifactTrace.traceId,
        sourceKind: artifactTrace.sourceKind,
        sourceRef: artifactTrace.sourceRef,
        reasoningContextAuditRef: artifactTrace.reasoningContextAuditRef,
        capturedAt: artifactTrace.capturedAt,
      };
    }

    return {
      traceId,
      sourceKind: entry.sourceKind,
      sourceRef: entry.sourceRef,
      reasoningContextAuditRef: sourceMap.reasoningContextAuditRef,
    };
  });
}

function buildCardTitle(entry: JudgmentReasoningSourceEntry): string {
  switch (entry.sourceKind) {
    case "GONGBUHO_JUDGMENT_LINK":
      return `판례 ${entry.sourceRef}`;
    case "APPROVED_REAL_TIME_SIGNAL":
      return `승인 signal ${entry.sourceRef}`;
    case "GONGBUHO_CONFIRMED_FACT":
      return `확정 사실 ${entry.sourceRef}`;
    case "GONGBUHO_EVIDENCE_MAP":
      return `증거 연결 ${entry.sourceRef}`;
    case "STATUTE_REF":
      return `법령 ${entry.sourceRef}`;
    default:
      return `근거 ${entry.sourceRef}`;
  }
}

export function evaluateJudgmentReasoningCard(card: JudgmentReasoningCard): {
  allowed: boolean;
  blockedBy?: JudgmentReasoningViewBoundaryMarker;
} {
  if (!card.sourceTraceRefs.length) {
    return { allowed: false, blockedBy: "NO_HIDDEN_REASONING_SOURCE" };
  }

  if (card.sourceKind === "GONGBUHO_JUDGMENT_LINK" && !card.canonicalSourceRef?.trim()) {
    return { allowed: false, blockedBy: "NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE" };
  }

  const certainty = detectOutcomePredictionAsCertainty(
    `${card.title} ${card.summary} ${card.relevanceNote} ${card.uncertaintyNote ?? ""}`,
  );
  if (certainty.detected) {
    return { allowed: false, blockedBy: "NO_CERTAIN_OUTCOME_LANGUAGE" };
  }

  if (
    card.sourceKind === "APPROVED_REAL_TIME_SIGNAL" &&
    card.authorityBadge === "APPROVED_REAL_TIME_SIGNAL" &&
    !card.canonicalSourceRef?.trim()
  ) {
    return { allowed: false, blockedBy: "NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE" };
  }

  if (card.hiddenSourceVisible !== true) {
    return { allowed: false, blockedBy: "NO_HIDDEN_REASONING_SOURCE" };
  }

  return { allowed: true };
}

export function evaluateJudgmentReasoningCardFromEntry(input: {
  entry: JudgmentReasoningSourceEntry;
  sourceMap: JudgmentReasoningSourceMap;
}): { allowed: boolean; blockedBy?: JudgmentReasoningViewBoundaryMarker } {
  const authorityBadge = resolveAuthorityBadge(input.entry);

  if (
    input.entry.sourceKind === "APPROVED_REAL_TIME_SIGNAL" &&
    !isApprovedRealTimeSignalStatus(input.entry.realTimeSignalStatus)
  ) {
    return { allowed: false, blockedBy: "NO_UNAPPROVED_SIGNAL_RENDERED_AS_AUTHORITY" };
  }

  const sourceTraceRefs = resolveSourceTraceRefs(input.entry, input.sourceMap);
  if (!sourceTraceRefs.length) {
    return { allowed: false, blockedBy: "NO_HIDDEN_REASONING_SOURCE" };
  }

  return evaluateJudgmentReasoningCard({
    cardId: `card-${input.entry.entryId}`,
    sourceEntryId: input.entry.entryId,
    sourceKind: input.entry.sourceKind,
    title: buildCardTitle(input.entry),
    summary: input.entry.summary,
    relevanceNote: input.entry.relevanceNote,
    canonicalSourceRef: input.entry.canonicalSourceRef,
    favorabilityBadge: buildJudgmentFavorabilityBadge({
      favorability: input.entry.favorability,
      sourceKind: input.entry.sourceKind,
    }),
    authorityBadge,
    sourceTraceRefs,
    uncertaintyNote: input.entry.uncertaintyNote,
    hiddenSourceVisible: true,
  });
}

export function assertJudgmentReasoningViewAllowed(sourceMap?: JudgmentReasoningSourceMap) {
  if (!sourceMap) {
    throw new ValidationError("NO_VIEW_WITHOUT_SOURCE_MAP");
  }

  const renderGate = canRenderJudgmentReasoningView({
    artifactSourceTrace: sourceMap.artifactSourceTrace,
    sourceEntries: sourceMap.sourceEntries,
    uncertaintySignals: sourceMap.uncertaintySignals,
    auditRef: sourceMap.auditRef,
  });

  if (!renderGate.allowed) {
    throw new ValidationError(renderGate.blockedBy ?? "NO_VIEW_WITHOUT_SOURCE_MAP");
  }
}

function deriveOverallSeverity(
  signals: JudgmentReasoningUncertaintySignal[],
): JudgmentReasoningUncertaintyPanel["overallSeverity"] {
  if (signals.some((signal) => signal.severity === "HIGH")) {
    return "HIGH";
  }
  if (signals.some((signal) => signal.severity === "MEDIUM")) {
    return "MEDIUM";
  }
  return "LOW";
}

export function buildUncertaintyPanel(input: {
  panelId: string;
  signals: JudgmentReasoningUncertaintySignal[];
}): JudgmentReasoningUncertaintyPanel {
  if (!input.signals.length) {
    throw new ValidationError("UNCERTAINTY_PANEL_REQUIRED");
  }

  return {
    panelId: input.panelId,
    signals: input.signals,
    overallSeverity: deriveOverallSeverity(input.signals),
    summary: `${input.signals.length} uncertainty signal(s) require lawyer review before reasoning view use.`,
  };
}

export function buildJudgmentReasoningCards(
  sourceMap: JudgmentReasoningSourceMap,
): JudgmentReasoningCard[] {
  assertJudgmentReasoningViewAllowed(sourceMap);

  const cards: JudgmentReasoningCard[] = [];

  for (const entry of sourceMap.sourceEntries) {
    const entryGate = evaluateJudgmentReasoningCardFromEntry({ entry, sourceMap });
    if (!entryGate.allowed) {
      throw new ValidationError(entryGate.blockedBy ?? "NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE");
    }

    const authorityBadge = resolveAuthorityBadge(entry);
    cards.push({
      cardId: `card-${entry.entryId}`,
      sourceEntryId: entry.entryId,
      sourceKind: entry.sourceKind,
      title: buildCardTitle(entry),
      summary: entry.summary,
      relevanceNote: entry.relevanceNote,
      canonicalSourceRef: entry.canonicalSourceRef,
      favorabilityBadge: buildJudgmentFavorabilityBadge({
        favorability: entry.favorability,
        sourceKind: entry.sourceKind,
      }),
      authorityBadge,
      sourceTraceRefs: resolveSourceTraceRefs(entry, sourceMap),
      uncertaintyNote: entry.uncertaintyNote,
      hiddenSourceVisible: true,
    });
  }

  if (cards.length !== sourceMap.sourceEntries.length) {
    throw new ValidationError("NO_HIDDEN_REASONING_SOURCE");
  }

  return cards;
}

export function buildJudgmentReasoningView(
  input: BuildJudgmentReasoningViewInput,
): JudgmentReasoningView {
  if (!input.auditRef.trim()) {
    throw new ValidationError("LAWYER_REVIEW_REQUIRED_FOR_REASONING_VIEW_USE");
  }

  assertJudgmentReasoningViewAllowed(input.sourceMap);

  const reasoningCards = buildJudgmentReasoningCards(input.sourceMap);
  const uncertaintyPanel = buildUncertaintyPanel({
    panelId: `unc-panel-${input.viewId}`,
    signals: input.sourceMap.uncertaintySignals,
  });

  for (const card of reasoningCards) {
    const cardGate = evaluateJudgmentReasoningCard(card);
    if (!cardGate.allowed) {
      throw new ValidationError(cardGate.blockedBy ?? "NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE");
    }
  }

  return judgmentReasoningViewSchema.parse({
    marker: PHASE64B_JUDGMENT_REASONING_VIEW_SCHEMA_MARKER,
    version: PHASE64B_JUDGMENT_REASONING_VIEW_VERSION,
    viewId: input.viewId,
    sourceMapId: input.sourceMap.mapId,
    caseId: input.sourceMap.caseId,
    tenantId: input.sourceMap.tenantId,
    targetKind: input.sourceMap.targetKind,
    targetRef: input.sourceMap.targetRef,
    reasoningContextAuditRef: input.sourceMap.reasoningContextAuditRef,
    aggregateFavorabilityBadge: computeAggregateFavorabilityBadge(reasoningCards),
    reasoningCards,
    uncertaintyPanel,
    artifactSourceTrace: input.sourceMap.artifactSourceTrace,
    reviewStatus: "LAWYER_REVIEW_REQUIRED",
    clientVisibleAllowed: false,
    lawyerReviewRequiredForUse: true,
    boundaries: DEFAULT_BOUNDARIES,
    auditRef: input.auditRef,
    phase64AVerifyScript: PHASE64B_PHASE64A_VERIFY_SCRIPT,
    phase64BVerifyScript: PHASE64B_JUDGMENT_REASONING_VIEW_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE64B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    createdAt: new Date().toISOString(),
  });
}
