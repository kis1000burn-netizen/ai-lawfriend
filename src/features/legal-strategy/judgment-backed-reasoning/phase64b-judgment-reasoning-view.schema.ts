/**
 * Product Phase 64-B — Judgment Reasoning View schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_BUILDER_PHASE64B.md
 */
import { z } from "zod";
import {
  judgmentReasoningArtifactSourceTraceSchema,
  judgmentReasoningSourceKindSchema,
  judgmentReasoningTargetKindSchema,
  judgmentReasoningUncertaintySeveritySchema,
  judgmentReasoningUncertaintySignalSchema,
  judgmentReasoningSourceMapSchema,
} from "./phase64a-judgment-reasoning-source-map.schema";

export const PHASE64B_JUDGMENT_REASONING_VIEW_VERSION = "64-B.1" as const;

export const PHASE64B_JUDGMENT_REASONING_VIEW_SCHEMA_MARKER =
  "phase64b-judgment-reasoning-view-schema" as const;

export const judgmentFavorabilityBadgeSchema = z.enum([
  "FAVORABLE",
  "UNFAVORABLE",
  "MIXED",
  "UNCERTAIN",
]);

export type JudgmentFavorabilityBadge = z.infer<typeof judgmentFavorabilityBadgeSchema>;

export const judgmentReasoningAuthorityBadgeSchema = z.enum([
  "NONE",
  "GONGBUHO_CONFIRMED",
  "APPROVED_REAL_TIME_SIGNAL",
]);

export type JudgmentReasoningAuthorityBadge = z.infer<
  typeof judgmentReasoningAuthorityBadgeSchema
>;

export const judgmentReasoningCardSourceTraceRefSchema = z.object({
  traceId: z.string().min(1),
  sourceKind: z.string().min(1),
  sourceRef: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1).optional(),
  capturedAt: z.string().datetime().optional(),
});

export type JudgmentReasoningCardSourceTraceRef = z.infer<
  typeof judgmentReasoningCardSourceTraceRefSchema
>;

export const judgmentReasoningCardSchema = z.object({
  cardId: z.string().min(1),
  sourceEntryId: z.string().min(1),
  sourceKind: judgmentReasoningSourceKindSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  relevanceNote: z.string().min(1),
  canonicalSourceRef: z.string().min(1).optional(),
  favorabilityBadge: judgmentFavorabilityBadgeSchema,
  authorityBadge: judgmentReasoningAuthorityBadgeSchema,
  sourceTraceRefs: z.array(judgmentReasoningCardSourceTraceRefSchema).min(1),
  uncertaintyNote: z.string().min(1).optional(),
  hiddenSourceVisible: z.literal(true),
});

export type JudgmentReasoningCard = z.infer<typeof judgmentReasoningCardSchema>;

export const judgmentReasoningUncertaintyPanelSchema = z.object({
  panelId: z.string().min(1),
  signals: z.array(judgmentReasoningUncertaintySignalSchema).min(1),
  overallSeverity: judgmentReasoningUncertaintySeveritySchema,
  summary: z.string().min(1),
});

export type JudgmentReasoningUncertaintyPanel = z.infer<
  typeof judgmentReasoningUncertaintyPanelSchema
>;

export const judgmentReasoningViewReviewStatusSchema = z.literal("LAWYER_REVIEW_REQUIRED");

export type JudgmentReasoningViewReviewStatus = z.infer<
  typeof judgmentReasoningViewReviewStatusSchema
>;

export const judgmentReasoningViewBoundariesSchema = z.object({
  noViewWithoutSourceMap: z.literal(true),
  noViewWithoutCanonicalJudgmentSource: z.literal(true),
  noHiddenReasoningSource: z.literal(true),
  noCertainOutcomeLanguage: z.literal(true),
  noClientVisibleReasoningViewByDefault: z.literal(true),
  noUnapprovedSignalRenderedAsAuthority: z.literal(true),
  uncertaintyPanelRequired: z.literal(true),
  lawyerReviewRequiredForReasoningViewUse: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const judgmentReasoningViewSchema = z.object({
  marker: z.literal(PHASE64B_JUDGMENT_REASONING_VIEW_SCHEMA_MARKER),
  version: z.literal(PHASE64B_JUDGMENT_REASONING_VIEW_VERSION),
  viewId: z.string().min(1),
  sourceMapId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  targetKind: judgmentReasoningTargetKindSchema,
  targetRef: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  aggregateFavorabilityBadge: judgmentFavorabilityBadgeSchema,
  reasoningCards: z.array(judgmentReasoningCardSchema).min(1),
  uncertaintyPanel: judgmentReasoningUncertaintyPanelSchema,
  artifactSourceTrace: z.array(judgmentReasoningArtifactSourceTraceSchema).min(1),
  reviewStatus: judgmentReasoningViewReviewStatusSchema,
  clientVisibleAllowed: z.literal(false),
  lawyerReviewRequiredForUse: z.literal(true),
  boundaries: judgmentReasoningViewBoundariesSchema,
  auditRef: z.string().min(1),
  phase64AVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase64a"),
  phase64BVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase64b"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  createdAt: z.string().datetime(),
});

export type JudgmentReasoningView = z.infer<typeof judgmentReasoningViewSchema>;

export const buildJudgmentReasoningViewInputSchema = z.object({
  viewId: z.string().min(1),
  sourceMap: judgmentReasoningSourceMapSchema,
  auditRef: z.string().min(1),
});

export type BuildJudgmentReasoningViewInput = z.infer<
  typeof buildJudgmentReasoningViewInputSchema
>;
