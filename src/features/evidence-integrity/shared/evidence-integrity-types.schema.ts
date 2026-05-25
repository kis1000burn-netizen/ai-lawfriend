/**
 * Product Phase 42 — Evidence integrity shared types (Zod SSOT).
 */
import { z } from "zod";

export const EVIDENCE_INTEGRITY_TYPES_SCHEMA_MARKER_PHASE42 =
  "phase42-evidence-integrity-types-schema" as const;

export const evidenceReviewStatusSchema = z.enum([
  "NEEDS_REVIEW",
  "CONFIRMED",
  "CORRECTED",
  "REJECTED",
]);

export const evidenceFileHashSchema = z.object({
  evidenceFileId: z.string().min(1),
  sha256Hash: z.string().min(1),
  uploadedAt: z.string().datetime(),
  uploadedByUserId: z.string().min(1),
  originalFilePreserved: z.literal(true),
});

export const evidenceChainOfCustodyLogEntrySchema = z.object({
  logId: z.string().min(1),
  evidenceFileId: z.string().min(1),
  action: z.enum(["UPLOAD", "VIEW", "ANALYZE", "EXTRACT", "MODIFY_ATTEMPT", "REVIEW"]),
  actorUserId: z.string().min(1),
  occurredAt: z.string().datetime(),
  modificationDetected: z.boolean(),
});

export const aiExtractSourceLinkSchema = z.object({
  extractId: z.string().min(1),
  evidenceFileId: z.string().min(1),
  extractedTextExcerpt: z.string().min(1),
  pageReference: z.string().optional(),
  paragraphReference: z.string().optional(),
  timestampReference: z.string().optional(),
  replacesOriginal: z.literal(false),
});

export const evidenceIntegrityRecordSchema = z.object({
  evidenceFileId: z.string().min(1),
  fileHash: evidenceFileHashSchema,
  chainOfCustody: z.array(evidenceChainOfCustodyLogEntrySchema).min(1),
  aiExtractLinks: z.array(aiExtractSourceLinkSchema).min(1),
  reviewStatus: evidenceReviewStatusSchema,
  tamperWarning: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type EvidenceFileHash = z.infer<typeof evidenceFileHashSchema>;
export type EvidenceChainOfCustodyLogEntry = z.infer<typeof evidenceChainOfCustodyLogEntrySchema>;
export type AiExtractSourceLink = z.infer<typeof aiExtractSourceLinkSchema>;
export type EvidenceIntegrityRecord = z.infer<typeof evidenceIntegrityRecordSchema>;
