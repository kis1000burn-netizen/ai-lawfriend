/**
 * Product Phase 42-A — EvidenceFileHashOriginalPreservation schema (Zod SSOT).
 */
import { z } from "zod";

export const EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_SCHEMA_MARKER_42A =
  "phase42a-evidence-file-hash-original-preservation-schema" as const;

export const EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_VERSION = "42-A.1" as const;

export const EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_ITEM_IDS = [
  "ORIGINAL_FILE_PRESERVED",
  "EVIDENCE_FILE_HASH",
  "UPLOAD_TIMESTAMP",
  "UPLOADER_IDENTITY",
  "HASH_REGISTRY_ENTRY",
] as const;

export const evidenceFileHashOriginalPreservationItemSchema = z.object({
  itemId: z.enum(EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const evidenceFileHashOriginalPreservationResultSchema = z.object({
  version: z.literal("42-A.1"),
  evidenceIntegrityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(evidenceFileHashOriginalPreservationItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  evidenceFileHashOriginalPreservationReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type EvidenceFileHashOriginalPreservationItemId = (typeof EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_ITEM_IDS)[number];
export type EvidenceFileHashOriginalPreservationResult = z.infer<typeof evidenceFileHashOriginalPreservationResultSchema>;
