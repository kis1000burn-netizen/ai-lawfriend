/**
 * Product Phase 42-B — EvidenceChainOfCustodyLog schema (Zod SSOT).
 */
import { z } from "zod";

export const EVIDENCE_CHAIN_OF_CUSTODY_LOG_SCHEMA_MARKER_42B =
  "phase42b-evidence-chain-of-custody-log-schema" as const;

export const EVIDENCE_CHAIN_OF_CUSTODY_LOG_VERSION = "42-B.1" as const;

export const EVIDENCE_CHAIN_OF_CUSTODY_LOG_ITEM_IDS = [
  "CUSTODY_LOG_ENTRY",
  "VIEW_HISTORY",
  "ANALYSIS_HISTORY",
  "MODIFICATION_FLAG",
  "CUSTODY_LAWYER_REVIEW",
] as const;

export const evidenceChainOfCustodyLogItemSchema = z.object({
  itemId: z.enum(EVIDENCE_CHAIN_OF_CUSTODY_LOG_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const evidenceChainOfCustodyLogResultSchema = z.object({
  version: z.literal("42-B.1"),
  evidenceIntegrityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(evidenceChainOfCustodyLogItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  evidenceChainOfCustodyLogReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type EvidenceChainOfCustodyLogItemId = (typeof EVIDENCE_CHAIN_OF_CUSTODY_LOG_ITEM_IDS)[number];
export type EvidenceChainOfCustodyLogResult = z.infer<typeof evidenceChainOfCustodyLogResultSchema>;
