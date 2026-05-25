/**
 * Product Phase 47-C — EvidenceIntegrityBundleGate policy SSOT.
 */
import { EVIDENCE_INTEGRITY_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./evidence-integrity-bundle-gate.registry";
import type { EvidenceIntegrityBundleGateResult } from "./evidence-integrity-bundle-gate.schema";
import { EVIDENCE_INTEGRITY_BUNDLE_GATE_VERSION } from "./evidence-integrity-bundle-gate.schema";

export const EVIDENCE_INTEGRITY_BUNDLE_GATE_POLICY_MARKER_47C =
  "phase47c-evidence-integrity-bundle-gate-policy" as const;

export const EVIDENCE_INTEGRITY_BUNDLE_GATE_GATE_MARKER_47C =
  "phase47c-evidence-integrity-bundle-gate-gate" as const;

export const LEGAL_RELIABILITY_BUNDLED_PHASE_42F =
  "42-F" as const;

export function assembleEvidenceIntegrityBundleGate(input: {
  legalReliabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): EvidenceIntegrityBundleGateResult {
  const items = EVIDENCE_INTEGRITY_BUNDLE_GATE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: EVIDENCE_INTEGRITY_BUNDLE_GATE_VERSION,
    legalReliabilityScopeSlug: input.legalReliabilityScopeSlug,
    bundledPhase: "42-F",
    bundledVerifyScript: "verify:aibeopchin-evidence-integrity-rc",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    evidenceIntegrityBundleGateReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
