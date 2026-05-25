/**
 * Product Phase 42-A — EvidenceFileHashOriginalPreservation policy SSOT.
 */
import { EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_ITEMS } from "./evidence-file-hash-original-preservation.registry";
import type { EvidenceFileHashOriginalPreservationResult } from "./evidence-file-hash-original-preservation.schema";
import { EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_VERSION } from "./evidence-file-hash-original-preservation.schema";

export const EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_POLICY_MARKER_42A =
  "phase42a-evidence-file-hash-original-preservation-policy" as const;

export const EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_GATE_MARKER_42A =
  "phase42a-evidence-file-hash-original-preservation-gate" as const;

export const EVIDENCE_INTEGRITY_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const EVIDENCE_INTEGRITY_BOUNDARY_ORIGINAL_PRESERVED =
  "ORIGINAL_FILE_PRESERVED" as const;

export function assembleEvidenceFileHashOriginalPreservation(input: {
  evidenceIntegrityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): EvidenceFileHashOriginalPreservationResult {
  const items = EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_VERSION,
    evidenceIntegrityScopeSlug: input.evidenceIntegrityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    evidenceFileHashOriginalPreservationReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
