/**
 * Product Phase 47-E — CourtReadyCaseRecordPackBundleGate SSOT.
 */
import type { CourtReadyCaseRecordPackBundleGateResult } from "./court-ready-case-record-pack-bundle-gate.schema";

export const COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_REGISTRY_MARKER_47E =
  "phase47e-court-ready-case-record-pack-bundle-gate-registry" as const;

export const LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG = "legal-reliability-platform-001" as const;

type CourtReadyCaseRecordPackBundleGateItem = Omit<CourtReadyCaseRecordPackBundleGateResult["items"][number], "defined">;

export const COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_ITEMS: CourtReadyCaseRecordPackBundleGateItem[] = [
  { itemId: "BUNDLED_RC_LOCK", label: "Bundled RC lock present", required: true },
  { itemId: "BUNDLED_VERIFY_SCRIPT", label: "Bundled verify script registered", required: true },
  { itemId: "LEGAL_RELIABILITY_CROSS_LINK", label: "Legal Reliability RC cross-link", required: true },
];
