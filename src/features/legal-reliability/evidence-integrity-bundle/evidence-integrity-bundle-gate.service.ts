/**
 * Product Phase 47-C — EvidenceIntegrityBundleGate service.
 */
import { EVIDENCE_INTEGRITY_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./evidence-integrity-bundle-gate.registry";
import { assembleEvidenceIntegrityBundleGate } from "./evidence-integrity-bundle-gate.policy";
import type { EvidenceIntegrityBundleGateResult } from "./evidence-integrity-bundle-gate.schema";

export const EVIDENCE_INTEGRITY_BUNDLE_GATE_SERVICE_MARKER_47C =
  "phase47c-evidence-integrity-bundle-gate-service" as const;

export function buildEvidenceIntegrityBundleGate(input?: {
  legalReliabilityScopeSlug?: string;
  definedItemIds?: string[];
}): EvidenceIntegrityBundleGateResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      EVIDENCE_INTEGRITY_BUNDLE_GATE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleEvidenceIntegrityBundleGate({
    legalReliabilityScopeSlug:
      input?.legalReliabilityScopeSlug ?? LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
