/**
 * Product Phase 47-G — NeutralLitigationReviewPackBundleGate service.
 */
import { NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./neutral-litigation-review-pack-bundle-gate.registry";
import { assembleNeutralLitigationReviewPackBundleGate } from "./neutral-litigation-review-pack-bundle-gate.policy";
import type { NeutralLitigationReviewPackBundleGateResult } from "./neutral-litigation-review-pack-bundle-gate.schema";

export const NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_SERVICE_MARKER_47G =
  "phase47g-neutral-litigation-review-pack-bundle-gate-service" as const;

export function buildNeutralLitigationReviewPackBundleGate(input?: {
  legalReliabilityScopeSlug?: string;
  definedItemIds?: string[];
}): NeutralLitigationReviewPackBundleGateResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleNeutralLitigationReviewPackBundleGate({
    legalReliabilityScopeSlug:
      input?.legalReliabilityScopeSlug ?? LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
