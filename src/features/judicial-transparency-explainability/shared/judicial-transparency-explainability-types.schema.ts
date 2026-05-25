/**
 * Product Phase 45 — Judicial Transparency / Explainability shared types (Zod SSOT).
 */
import { z } from "zod";

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_TYPES_SCHEMA_MARKER_PHASE45 =
  "phase45-judicial-transparency-explainability-types-schema" as const;

export const explainabilityUncertaintyLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const explainabilityFinalReviewerStatusSchema = z.enum([
  "NEEDS_REVIEW",
  "CONFIRMED",
  "CORRECTED",
  "REJECTED",
]);

export const explainabilityEvidenceUsedSchema = z.object({
  evidenceId: z.string().min(1),
  label: z.string().min(1),
});

export const explainabilityJudgmentReferencedSchema = z.object({
  judgmentId: z.string().min(1),
  label: z.string().min(1),
});

export const explainabilityExcludedMaterialSchema = z.object({
  materialId: z.string().min(1),
  reason: z.string().min(1),
});

export const explainabilityLinkedClaimSchema = z.object({
  claimId: z.string().min(1),
  label: z.string().min(1),
});

export const explainabilitySimilarityDifferenceAnalysisSchema = z.object({
  similarityNotes: z.string().min(1),
  differenceNotes: z.string().min(1),
});

export const explainabilityUncertaintySignalSchema = z.object({
  signalId: z.string().min(1),
  level: explainabilityUncertaintyLevelSchema,
  note: z.string().min(1),
});

export const explainabilityLawyerCorrectionEntrySchema = z.object({
  correctionId: z.string().min(1),
  fieldPath: z.string().min(1),
  correctedBy: z.string().min(1),
  correctedAt: z.string().datetime(),
});

export const explainabilityFinalReviewerSchema = z.object({
  reviewerId: z.string().min(1),
  status: explainabilityFinalReviewerStatusSchema,
});

export const aiExplainabilityTraceSchema = z.object({
  traceId: z.string().min(1),
  explainabilityScopeSlug: z.string().min(1),
  evidenceUsed: z.array(explainabilityEvidenceUsedSchema).min(1),
  judgmentsReferenced: z.array(explainabilityJudgmentReferencedSchema).min(1),
  excludedMaterials: z.array(explainabilityExcludedMaterialSchema).min(1),
  linkedClaims: z.array(explainabilityLinkedClaimSchema).min(1),
  similarityDifferenceAnalysis: explainabilitySimilarityDifferenceAnalysisSchema,
  uncertaintySignals: z.array(explainabilityUncertaintySignalSchema).min(1),
  lawyerCorrectionHistory: z.array(explainabilityLawyerCorrectionEntrySchema),
  finalReviewer: explainabilityFinalReviewerSchema,
  courtReadyPackItemRefs: z.array(z.string().min(1)).min(1),
  unexplainedOutputAllowed: z.literal(false),
  lawyerReviewRequired: z.literal(true),
});

export type AiExplainabilityTrace = z.infer<typeof aiExplainabilityTraceSchema>;
