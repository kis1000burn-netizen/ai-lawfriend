/**
 * Product Phase 47-E — CourtReadyCaseRecordPackBundleGate service.
 */
import { COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./court-ready-case-record-pack-bundle-gate.registry";
import { assembleCourtReadyCaseRecordPackBundleGate } from "./court-ready-case-record-pack-bundle-gate.policy";
import type { CourtReadyCaseRecordPackBundleGateResult } from "./court-ready-case-record-pack-bundle-gate.schema";

export const COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_SERVICE_MARKER_47E =
  "phase47e-court-ready-case-record-pack-bundle-gate-service" as const;

export function buildCourtReadyCaseRecordPackBundleGate(input?: {
  legalReliabilityScopeSlug?: string;
  definedItemIds?: string[];
}): CourtReadyCaseRecordPackBundleGateResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleCourtReadyCaseRecordPackBundleGate({
    legalReliabilityScopeSlug:
      input?.legalReliabilityScopeSlug ?? LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
