/**
 * Product Phase 47 — Legal Reliability Platform shared types (Zod SSOT).
 */
import { z } from "zod";

export const LEGAL_RELIABILITY_TYPES_SCHEMA_MARKER_PHASE47 =
  "phase47-legal-reliability-types-schema" as const;

export const legalReliabilityBundledPhaseSchema = z.enum([
  "40-F",
  "41-F",
  "42-F",
  "43-F",
  "44-F",
  "45-F",
  "46-F",
]);

export const legalReliabilityPlatformSealSchema = z.object({
  sealId: z.string().min(1),
  legalReliabilityScopeSlug: z.string().min(1),
  bundledPhases: z.array(legalReliabilityBundledPhaseSchema).length(7),
  noPrediction: z.literal(true),
  noGuarantee: z.literal(true),
  lawyerReviewRequired: z.literal(true),
  noCourtDirectAccess: z.literal(true),
  noUnrevealedSourceOmission: z.literal(true),
  noAiOutputWithoutEvidenceJudgmentTrace: z.literal(true),
});

export type LegalReliabilityPlatformSeal = z.infer<typeof legalReliabilityPlatformSealSchema>;
