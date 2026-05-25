/**
 * Product Phase 47-D — ClaimEvidenceJudgmentGraphBundleGate service.
 */
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./claim-evidence-judgment-graph-bundle-gate.registry";
import { assembleClaimEvidenceJudgmentGraphBundleGate } from "./claim-evidence-judgment-graph-bundle-gate.policy";
import type { ClaimEvidenceJudgmentGraphBundleGateResult } from "./claim-evidence-judgment-graph-bundle-gate.schema";

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_SERVICE_MARKER_47D =
  "phase47d-claim-evidence-judgment-graph-bundle-gate-service" as const;

export function buildClaimEvidenceJudgmentGraphBundleGate(input?: {
  legalReliabilityScopeSlug?: string;
  definedItemIds?: string[];
}): ClaimEvidenceJudgmentGraphBundleGateResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleClaimEvidenceJudgmentGraphBundleGate({
    legalReliabilityScopeSlug:
      input?.legalReliabilityScopeSlug ?? LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
