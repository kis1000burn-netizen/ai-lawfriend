/**
 * Product Phase 64-A — Judgment Reasoning Source Map schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_SOURCE_MAP_PHASE64A.md
 */
import { z } from "zod";
import { realTimeLegalSignalStatusSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { gongbuhoReasoningContextBundleSchema } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import { strategyCandidateSchema } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import { evidenceGapCandidateSchema } from "@/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.schema";
import { counterArgumentCandidateSchema } from "@/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.schema";
import { counterArgumentDraftParagraphSchema } from "@/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.schema";

export const PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERSION = "64-A.1" as const;

export const PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_SCHEMA_MARKER =
  "phase64a-judgment-reasoning-source-map-schema" as const;

export const judgmentReasoningTargetKindSchema = z.enum([
  "STRATEGY_CANDIDATE",
  "EVIDENCE_GAP_CANDIDATE",
  "COUNTER_ARGUMENT_CANDIDATE",
  "DRAFT_PARAGRAPH",
]);

export type JudgmentReasoningTargetKind = z.infer<typeof judgmentReasoningTargetKindSchema>;

export const judgmentReasoningSourceKindSchema = z.enum([
  "GONGBUHO_CONFIRMED_FACT",
  "GONGBUHO_DISPUTED_FACT",
  "GONGBUHO_JUDGMENT_LINK",
  "GONGBUHO_EVIDENCE_MAP",
  "STATUTE_REF",
  "REUSABLE_LEGAL_PATTERN",
  "APPROVED_REAL_TIME_SIGNAL",
  "ARTIFACT_SOURCE_TRACE",
]);

export type JudgmentReasoningSourceKind = z.infer<typeof judgmentReasoningSourceKindSchema>;

export const judgmentCaseFavorabilitySchema = z.enum([
  "FAVORABLE",
  "UNFAVORABLE",
  "NEUTRAL",
  "UNCERTAIN",
]);

export type JudgmentCaseFavorability = z.infer<typeof judgmentCaseFavorabilitySchema>;

export const judgmentReasoningUncertaintyKindSchema = z.enum([
  "DISPUTED_FACT_PRESENT",
  "CONFLICTING_EVIDENCE",
  "WEAK_JUDGMENT_LINK",
  "LAWYER_REVIEW_REQUIRED",
  "EXCLUDED_UNAPPROVED_SIGNAL",
  "INCOMPLETE_CANONICAL_SOURCE",
  "ARTIFACT_REVIEW_PENDING",
]);

export type JudgmentReasoningUncertaintyKind = z.infer<
  typeof judgmentReasoningUncertaintyKindSchema
>;

export const judgmentReasoningUncertaintySeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export type JudgmentReasoningUncertaintySeverity = z.infer<
  typeof judgmentReasoningUncertaintySeveritySchema
>;

export const judgmentReasoningArtifactSourceTraceSchema = z.object({
  traceId: z.string().min(1),
  sourceKind: z.string().min(1),
  sourceRef: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  capturedAt: z.string().datetime(),
});

export type JudgmentReasoningArtifactSourceTrace = z.infer<
  typeof judgmentReasoningArtifactSourceTraceSchema
>;

export const judgmentReasoningSourceEntrySchema = z.object({
  entryId: z.string().min(1),
  sourceKind: judgmentReasoningSourceKindSchema,
  sourceRef: z.string().min(1),
  summary: z.string().min(1),
  relevanceNote: z.string().min(1),
  canonicalSourceRef: z.string().min(1).optional(),
  favorability: judgmentCaseFavorabilitySchema.default("UNCERTAIN"),
  realTimeSignalStatus: realTimeLegalSignalStatusSchema.optional(),
  linkedSourceTraceIds: z.array(z.string().min(1)).min(1),
  uncertaintyNote: z.string().min(1).optional(),
});

export type JudgmentReasoningSourceEntry = z.infer<typeof judgmentReasoningSourceEntrySchema>;

export const judgmentReasoningUncertaintySignalSchema = z.object({
  signalId: z.string().min(1),
  kind: judgmentReasoningUncertaintyKindSchema,
  summary: z.string().min(1),
  severity: judgmentReasoningUncertaintySeveritySchema,
  linkedEntryIds: z.array(z.string().min(1)).default([]),
});

export type JudgmentReasoningUncertaintySignal = z.infer<
  typeof judgmentReasoningUncertaintySignalSchema
>;

export const judgmentReasoningSourceMapBoundariesSchema = z.object({
  noReasoningViewWithoutSourceTrace: z.literal(true),
  noJudgmentUseWithoutCanonicalSource: z.literal(true),
  noUnapprovedRealTimeSignalInReasoningView: z.literal(true),
  noCaseOutcomePredictionAsCertainty: z.literal(true),
  noClientVisibleJudgmentReasoningByDefault: z.literal(true),
  uncertaintySignalRequired: z.literal(true),
  judgmentReasoningAuditRequired: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const judgmentReasoningSourceMapSchema = z.object({
  marker: z.literal(PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_SCHEMA_MARKER),
  version: z.literal(PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERSION),
  mapId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  targetKind: judgmentReasoningTargetKindSchema,
  targetRef: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContextBundleVersion: z.literal("59-C.1"),
  sourceEntries: z.array(judgmentReasoningSourceEntrySchema).min(1),
  artifactSourceTrace: z.array(judgmentReasoningArtifactSourceTraceSchema).min(1),
  uncertaintySignals: z.array(judgmentReasoningUncertaintySignalSchema).min(1),
  clientVisibleAllowed: z.literal(false),
  lawyerReviewRequiredForClientVisibility: z.literal(true),
  boundaries: judgmentReasoningSourceMapBoundariesSchema,
  auditRef: z.string().min(1),
  counterArgumentDraftEngineRcVerifyScript: z.literal(
    "verify:aibeopchin-counter-argument-draft-engine-rc",
  ),
  phase64AVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase64a"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  createdAt: z.string().datetime(),
});

export type JudgmentReasoningSourceMap = z.infer<typeof judgmentReasoningSourceMapSchema>;

export const buildJudgmentReasoningSourceMapInputSchema = z.object({
  mapId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  targetKind: judgmentReasoningTargetKindSchema,
  targetRef: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  strategyCandidate: strategyCandidateSchema.optional(),
  evidenceGapCandidate: evidenceGapCandidateSchema.optional(),
  counterArgumentCandidate: counterArgumentCandidateSchema.optional(),
  draftParagraph: counterArgumentDraftParagraphSchema.optional(),
  artifactSourceTrace: z.array(judgmentReasoningArtifactSourceTraceSchema).min(1),
  auditRef: z.string().min(1),
});

export type BuildJudgmentReasoningSourceMapInput = z.infer<
  typeof buildJudgmentReasoningSourceMapInputSchema
>;
