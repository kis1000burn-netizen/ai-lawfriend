/**
 * Product Phase 63-D — Draft Paragraph Generator schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_PARAGRAPH_GENERATOR_PHASE63D.md
 */
import { z } from "zod";
import { gongbuhoReasoningContextBundleSchema } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import {
  counterArgumentCandidateSchema,
  counterArgumentSourceTraceSchema,
} from "./phase63b-counter-argument-candidate.schema";
import {
  backfireRiskReportSchema,
  backfireRiskLevelSchema,
} from "./phase63c-risk-backfire-check.schema";

export const PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERSION = "63-D.1" as const;

export const PHASE63D_DRAFT_PARAGRAPH_GENERATOR_SCHEMA_MARKER =
  "phase63d-draft-paragraph-generator-schema" as const;

export const draftParagraphRiskLevelAtGenerationSchema = backfireRiskLevelSchema.exclude([
  "CRITICAL",
]);

export type DraftParagraphRiskLevelAtGeneration = z.infer<
  typeof draftParagraphRiskLevelAtGenerationSchema
>;

export const counterArgumentDraftParagraphPurposeSchema = z.enum([
  "FACTUAL_REBUTTAL",
  "EVIDENCE_REBUTTAL",
  "LEGAL_REBUTTAL",
  "JUDGMENT_DISTINCTION",
  "BURDEN_OF_PROOF_ARGUMENT",
  "DAMAGES_ARGUMENT",
  "PROCEDURAL_ARGUMENT",
]);

export type CounterArgumentDraftParagraphPurpose = z.infer<
  typeof counterArgumentDraftParagraphPurposeSchema
>;

export const counterArgumentDraftParagraphReviewStatusSchema = z.literal(
  "LAWYER_REVIEW_REQUIRED",
);

export type CounterArgumentDraftParagraphReviewStatus = z.infer<
  typeof counterArgumentDraftParagraphReviewStatusSchema
>;

export const draftParagraphSourceTraceSchema = counterArgumentSourceTraceSchema.extend({
  backfireRiskReportId: z.string().min(1).optional(),
  draftParagraphPurpose: counterArgumentDraftParagraphPurposeSchema.optional(),
});

export type DraftParagraphSourceTrace = z.infer<typeof draftParagraphSourceTraceSchema>;

export const counterArgumentDraftParagraphBoundariesSchema = z.object({
  noDraftParagraphWithoutCounterArgument: z.literal(true),
  noDraftParagraphWithoutBackfireCheck: z.literal(true),
  noDraftParagraphFromCriticalRisk: z.literal(true),
  noFinalDocumentTextByAi: z.literal(true),
  noDocumentInsertWithoutLawyerApproval: z.literal(true),
  noClientVisibleDraftParagraph: z.literal(true),
  noAutoFiledDraftParagraph: z.literal(true),
  noParagraphWithoutSourceTrace: z.literal(true),
  noParagraphWithoutAuditRef: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const counterArgumentDraftParagraphSchema = z.object({
  marker: z.literal(PHASE63D_DRAFT_PARAGRAPH_GENERATOR_SCHEMA_MARKER),
  version: z.literal(PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERSION),
  paragraphId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  sourceCounterArgumentCandidateId: z.string().min(1),
  sourceBackfireRiskReportId: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  paragraphPurpose: counterArgumentDraftParagraphPurposeSchema,
  draftText: z.string().min(1),
  sourceTrace: z.array(draftParagraphSourceTraceSchema).min(1),
  riskLevelAtGeneration: draftParagraphRiskLevelAtGenerationSchema,
  reviewStatus: counterArgumentDraftParagraphReviewStatusSchema,
  isFinalDocumentText: z.literal(false),
  documentInsertAllowed: z.literal(false),
  clientVisibleAllowed: z.literal(false),
  autoFileAllowed: z.literal(false),
  boundaries: counterArgumentDraftParagraphBoundariesSchema,
  auditRef: z.string().min(1),
  phase63CVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63c"),
  phase63DVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63d"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  generatedAt: z.string().datetime(),
});

export type CounterArgumentDraftParagraph = z.infer<
  typeof counterArgumentDraftParagraphSchema
>;

export const buildCounterArgumentDraftParagraphInputSchema = z.object({
  paragraphId: z.string().min(1),
  counterArgumentCandidate: counterArgumentCandidateSchema,
  backfireRiskReport: backfireRiskReportSchema,
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  paragraphPurpose: counterArgumentDraftParagraphPurposeSchema,
  draftText: z.string().min(1),
  sourceTrace: z.array(draftParagraphSourceTraceSchema).min(1),
  auditRef: z.string().min(1),
});

export type BuildCounterArgumentDraftParagraphInput = z.infer<
  typeof buildCounterArgumentDraftParagraphInputSchema
>;

export const generateDraftParagraphsInputSchema = z.object({
  counterArgumentCandidate: counterArgumentCandidateSchema,
  backfireRiskReport: backfireRiskReportSchema,
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  auditRef: z.string().min(1),
});

export type GenerateDraftParagraphsInput = z.infer<typeof generateDraftParagraphsInputSchema>;
