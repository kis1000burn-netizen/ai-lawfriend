/**
 * Product Phase 47-G — NeutralLitigationReviewPackBundleGate SSOT.
 */
import type { NeutralLitigationReviewPackBundleGateResult } from "./neutral-litigation-review-pack-bundle-gate.schema";

export const NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_REGISTRY_MARKER_47G =
  "phase47g-neutral-litigation-review-pack-bundle-gate-registry" as const;

export const LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG = "legal-reliability-platform-001" as const;

type NeutralLitigationReviewPackBundleGateItem = Omit<NeutralLitigationReviewPackBundleGateResult["items"][number], "defined">;

export const NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_ITEMS: NeutralLitigationReviewPackBundleGateItem[] = [
  { itemId: "BUNDLED_RC_LOCK", label: "Bundled RC lock present", required: true },
  { itemId: "BUNDLED_VERIFY_SCRIPT", label: "Bundled verify script registered", required: true },
  { itemId: "LEGAL_RELIABILITY_CROSS_LINK", label: "Legal Reliability RC cross-link", required: true },
];
