/**
 * Product Phase 44 — Court-Ready Case Record Pack shared types (Zod SSOT).
 */
import { z } from "zod";

export const COURT_READY_CASE_RECORD_PACK_TYPES_SCHEMA_MARKER_PHASE44 =
  "phase44-court-ready-case-record-pack-types-schema" as const;

export const courtReadyPackSectionTypeSchema = z.enum([
  "CASE_SUMMARY",
  "ISSUE_TABLE",
  "EVIDENCE_LIST",
  "JUDGMENT_PROCEDURE",
]);

export const courtReadyLawyerReviewStatusSchema = z.enum([
  "NEEDS_REVIEW",
  "CONFIRMED",
  "CORRECTED",
  "REJECTED",
]);

export const courtReadyCaseRecordPackSchema = z.object({
  packId: z.string().min(1),
  casePackScopeSlug: z.string().min(1),
  sections: z.array(courtReadyPackSectionTypeSchema).min(1),
  courtReadyMarked: z.literal(false),
  automaticCourtSubmission: z.literal(false),
  eFilingAutoUpload: z.literal(false),
  internalStrategyGraphIncluded: z.literal(false),
  sensitiveClientCounselingIncluded: z.literal(false),
  lawyerReviewRequired: z.literal(true),
  lawyerReviewStatus: courtReadyLawyerReviewStatusSchema,
});

export type CourtReadyCaseRecordPack = z.infer<typeof courtReadyCaseRecordPackSchema>;
