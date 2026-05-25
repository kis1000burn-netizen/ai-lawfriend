/**
 * Product Phase 44-C — EvidenceListPack schema (Zod SSOT).
 */
import { z } from "zod";

export const EVIDENCE_LIST_PACK_SCHEMA_MARKER_44C =
  "phase44c-evidence-list-pack-schema" as const;

export const EVIDENCE_LIST_PACK_VERSION = "44-C.1" as const;

export const EVIDENCE_LIST_PACK_ITEM_IDS = [
  "EVIDENCE_INDEX",
  "EXHIBIT_NUMBERING",
  "CUSTODY_REFERENCE",
  "EVIDENCE_LIST_LAWYER_REVIEW",
] as const;

export const evidence_list_packItemSchema = z.object({
  itemId: z.enum(EVIDENCE_LIST_PACK_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const evidence_list_packResultSchema = z.object({
  version: z.literal("44-C.1"),
  casePackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(evidence_list_packItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  evidenceListPackReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type EvidenceListPackItemId = (typeof EVIDENCE_LIST_PACK_ITEM_IDS)[number];
export type EvidenceListPackResult = z.infer<typeof evidence_list_packResultSchema>;
