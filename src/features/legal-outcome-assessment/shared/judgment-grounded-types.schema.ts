/**
 * Product Phase 40 — Judgment-grounded outcome assessment shared types (Zod SSOT).
 */
import { z } from "zod";

export const JUDGMENT_GROUNDED_TYPES_SCHEMA_MARKER_PHASE40 =
  "phase40-judgment-grounded-types-schema" as const;

export const judgmentReferenceSourceTypeSchema = z.enum([
  "OFFICIAL",
  "LICENSED_DB",
  "INTERNAL_REVIEWED",
]);

export const judgmentReferenceSimilaritySchema = z.object({
  factSimilarityScore: z.number().min(0).max(100),
  legalIssueSimilarityScore: z.number().min(0).max(100),
  distinctionRisk: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const judgmentReferenceParagraphSchema = z.object({
  paragraphId: z.string().min(1),
  textExcerpt: z.string().min(1),
  relevanceReason: z.string().min(1),
});

export const judgmentReferenceLawyerReviewStatusSchema = z.enum([
  "NEEDS_REVIEW",
  "CONFIRMED",
  "CORRECTED",
  "REJECTED",
]);

/** Optional criminal sentencing extension — full SSOT in Phase 41 SentencingOutcomeReference. */
export const judgmentReferenceCriminalSentencingExtensionSchema = z.object({
  offenseName: z.string().min(1),
  sentenceType: z.enum([
    "IMPRISONMENT",
    "SUSPENDED_SENTENCE",
    "FINE",
    "PROBATION",
    "ACQUITTAL",
    "DISMISSAL",
    "OTHER",
  ]),
  sentenceText: z.string().min(1),
  imprisonmentMonths: z.number().optional(),
  suspendedSentenceYears: z.number().optional(),
  fineAmount: z.number().optional(),
});

export const judgmentReferenceSchema = z.object({
  judgmentId: z.string().min(1),
  courtName: z.string().min(1),
  caseNumber: z.string().min(1),
  decisionDate: z.string().min(1),
  title: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  sourceType: judgmentReferenceSourceTypeSchema,
  holdingSummary: z.string().min(1),
  relevantParagraphs: z.array(judgmentReferenceParagraphSchema).min(1),
  similarity: judgmentReferenceSimilaritySchema,
  lawyerReviewStatus: judgmentReferenceLawyerReviewStatusSchema,
  criminalSentencingExtension: judgmentReferenceCriminalSentencingExtensionSchema.optional(),
});

export const outcomeAssessmentSectionTypeSchema = z.enum([
  "CLAIM",
  "ISSUE",
  "BURDEN_OF_PROOF",
  "EVIDENCE_STRENGTH",
  "OPPONENT_ARGUMENT",
  "OUTCOME_SCENARIO",
]);

export const outcomeAssessmentSectionSchema = z.object({
  sectionType: outcomeAssessmentSectionTypeSchema,
  summary: z.string().min(1),
  judgmentReferences: z.array(judgmentReferenceSchema).min(1),
  noJudgmentFallbackAllowed: z.literal(false),
  lawyerReviewRequired: z.literal(true),
});

export type JudgmentReference = z.infer<typeof judgmentReferenceSchema>;
export type OutcomeAssessmentSection = z.infer<typeof outcomeAssessmentSectionSchema>;
