/**
 * Product Phase 42-A — EvidenceFileHashOriginalPreservation service.
 */
import {
  EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
  EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_ITEMS,
} from "./evidence-file-hash-original-preservation.registry";
import { assembleEvidenceFileHashOriginalPreservation } from "./evidence-file-hash-original-preservation.policy";
import type { EvidenceFileHashOriginalPreservationResult } from "./evidence-file-hash-original-preservation.schema";

export const EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_SERVICE_MARKER_42A =
  "phase42a-evidence-file-hash-original-preservation-service" as const;

export function buildEvidenceFileHashOriginalPreservation(input?: {
  evidenceIntegrityScopeSlug?: string;
  definedItemIds?: string[];
}): EvidenceFileHashOriginalPreservationResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleEvidenceFileHashOriginalPreservation({
    evidenceIntegrityScopeSlug: input?.evidenceIntegrityScopeSlug ?? EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
