/**
 * Product Phase 44-C — EvidenceListPack policy SSOT.
 */
import { EVIDENCE_LIST_PACK_ITEMS, COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG } from "./evidence-list-pack.registry";
import type { EvidenceListPackResult } from "./evidence-list-pack.schema";
import { EVIDENCE_LIST_PACK_VERSION } from "./evidence-list-pack.schema";

export const EVIDENCE_LIST_PACK_POLICY_MARKER_44C =
  "phase44c-evidence-list-pack-policy" as const;

export const EVIDENCE_LIST_PACK_GATE_MARKER_44C =
  "phase44c-evidence-list-pack-gate" as const;


export function assembleEvidenceListPack(input: {
  casePackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): EvidenceListPackResult {
  const items = EVIDENCE_LIST_PACK_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: EVIDENCE_LIST_PACK_VERSION,
    casePackScopeSlug: input.casePackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    evidenceListPackReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
