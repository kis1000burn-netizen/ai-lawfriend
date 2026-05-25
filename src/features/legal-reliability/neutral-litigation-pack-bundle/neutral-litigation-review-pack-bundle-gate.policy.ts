/**
 * Product Phase 47-G — NeutralLitigationReviewPackBundleGate policy SSOT.
 */
import { NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./neutral-litigation-review-pack-bundle-gate.registry";
import type { NeutralLitigationReviewPackBundleGateResult } from "./neutral-litigation-review-pack-bundle-gate.schema";
import { NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_VERSION } from "./neutral-litigation-review-pack-bundle-gate.schema";

export const NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_POLICY_MARKER_47G =
  "phase47g-neutral-litigation-review-pack-bundle-gate-policy" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_GATE_MARKER_47G =
  "phase47g-neutral-litigation-review-pack-bundle-gate-gate" as const;

export const LEGAL_RELIABILITY_BUNDLED_PHASE_46F =
  "46-F" as const;

export function assembleNeutralLitigationReviewPackBundleGate(input: {
  legalReliabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): NeutralLitigationReviewPackBundleGateResult {
  const items = NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_VERSION,
    legalReliabilityScopeSlug: input.legalReliabilityScopeSlug,
    bundledPhase: "46-F",
    bundledVerifyScript: "verify:aibeopchin-neutral-litigation-review-pack-rc",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    neutralLitigationReviewPackBundleGateReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
