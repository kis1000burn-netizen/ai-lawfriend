/**
 * Product Phase 44-C — EvidenceListPack service.
 */
import {
  COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
  EVIDENCE_LIST_PACK_ITEMS,
} from "./evidence-list-pack.registry";
import { assembleEvidenceListPack } from "./evidence-list-pack.policy";
import type { EvidenceListPackResult } from "./evidence-list-pack.schema";

export const EVIDENCE_LIST_PACK_SERVICE_MARKER_44C =
  "phase44c-evidence-list-pack-service" as const;

export function buildEvidenceListPack(input?: {
  casePackScopeSlug?: string;
  definedItemIds?: string[];
}): EvidenceListPackResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      EVIDENCE_LIST_PACK_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleEvidenceListPack({
    casePackScopeSlug: input?.casePackScopeSlug ?? COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
