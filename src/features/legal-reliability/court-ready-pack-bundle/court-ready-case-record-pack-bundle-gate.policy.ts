/**
 * Product Phase 47-E — CourtReadyCaseRecordPackBundleGate policy SSOT.
 */
import { COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./court-ready-case-record-pack-bundle-gate.registry";
import type { CourtReadyCaseRecordPackBundleGateResult } from "./court-ready-case-record-pack-bundle-gate.schema";
import { COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_VERSION } from "./court-ready-case-record-pack-bundle-gate.schema";

export const COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_POLICY_MARKER_47E =
  "phase47e-court-ready-case-record-pack-bundle-gate-policy" as const;

export const COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_GATE_MARKER_47E =
  "phase47e-court-ready-case-record-pack-bundle-gate-gate" as const;

export const LEGAL_RELIABILITY_BUNDLED_PHASE_44F =
  "44-F" as const;

export function assembleCourtReadyCaseRecordPackBundleGate(input: {
  legalReliabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): CourtReadyCaseRecordPackBundleGateResult {
  const items = COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_VERSION,
    legalReliabilityScopeSlug: input.legalReliabilityScopeSlug,
    bundledPhase: "44-F",
    bundledVerifyScript: "verify:aibeopchin-court-ready-case-record-pack-rc",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    courtReadyCaseRecordPackBundleGateReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
