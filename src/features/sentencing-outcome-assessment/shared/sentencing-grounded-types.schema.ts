/**
 * Product Phase 41 — Sentencing-grounded outcome assessment shared types (Zod SSOT).
 */
import { z } from "zod";

export const SENTENCING_GROUNDED_TYPES_SCHEMA_MARKER_PHASE41 =
  "phase41-sentencing-grounded-types-schema" as const;

export const sentenceTypeSchema = z.enum([
  "IMPRISONMENT",
  "SUSPENDED_SENTENCE",
  "FINE",
  "PROBATION",
  "ACQUITTAL",
  "DISMISSAL",
  "OTHER",
]);

export const sentencingReasonsSchema = z.object({
  favorable: z.array(z.string()),
  unfavorable: z.array(z.string()),
  neutral: z.array(z.string()),
});

export const comparableFactorsSchema = z.object({
  damageAmount: z.number().optional(),
  settlementStatus: z.enum(["NONE", "PARTIAL", "FULL", "UNKNOWN"]).optional(),
  priorRecord: z.enum(["NONE", "SAME_KIND", "OTHER", "UNKNOWN"]).optional(),
  confession: z.enum(["FULL", "PARTIAL", "DENIED", "UNKNOWN"]).optional(),
  victimForgiveness: z.boolean().optional(),
  restitution: z.boolean().optional(),
});

export const sentencingOutcomeSimilaritySchema = z.object({
  factSimilarityScore: z.number().min(0).max(100),
  sentencingFactorSimilarityScore: z.number().min(0).max(100),
  distinctionRisk: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const sentencingLawyerReviewStatusSchema = z.enum([
  "NEEDS_REVIEW",
  "CONFIRMED",
  "CORRECTED",
  "REJECTED",
]);

export const sentencingOutcomeReferenceSchema = z.object({
  judgmentId: z.string().min(1),
  courtName: z.string().min(1),
  caseNumber: z.string().min(1),
  decisionDate: z.string().min(1),
  offenseName: z.string().min(1),
  sentenceType: sentenceTypeSchema,
  sentenceText: z.string().min(1),
  imprisonmentMonths: z.number().optional(),
  suspendedSentenceYears: z.number().optional(),
  fineAmount: z.number().optional(),
  sentencingReasons: sentencingReasonsSchema,
  comparableFactors: comparableFactorsSchema,
  similarity: sentencingOutcomeSimilaritySchema,
  lawyerReviewStatus: sentencingLawyerReviewStatusSchema,
});

export const sentencingAssessmentSectionTypeSchema = z.enum([
  "OFFENSE",
  "SENTENCING_FACTOR",
  "SENTENCING_RANGE",
  "SUSPENSION_RISK",
  "SETTLEMENT_IMPACT",
  "PRIOR_RECORD_IMPACT",
  "VICTIM_STATEMENT_IMPACT",
]);

export const sentencingAssessmentSectionSchema = z.object({
  sectionType: sentencingAssessmentSectionTypeSchema,
  summary: z.string().min(1),
  sentencingOutcomeReferences: z.array(sentencingOutcomeReferenceSchema).min(1),
  noJudgmentFallbackAllowed: z.literal(false),
  noOutcomeGuaranteeAllowed: z.literal(true),
  lawyerReviewRequired: z.literal(true),
  clientVisibleBeforeReview: z.literal(false),
});

export type SentencingOutcomeReference = z.infer<typeof sentencingOutcomeReferenceSchema>;
export type SentencingAssessmentSection = z.infer<typeof sentencingAssessmentSectionSchema>;
