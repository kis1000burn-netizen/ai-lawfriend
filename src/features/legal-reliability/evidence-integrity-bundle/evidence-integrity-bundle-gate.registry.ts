/**
 * Product Phase 47-C — EvidenceIntegrityBundleGate SSOT.
 */
import type { EvidenceIntegrityBundleGateResult } from "./evidence-integrity-bundle-gate.schema";

export const EVIDENCE_INTEGRITY_BUNDLE_GATE_REGISTRY_MARKER_47C =
  "phase47c-evidence-integrity-bundle-gate-registry" as const;

export const LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG = "legal-reliability-platform-001" as const;

type EvidenceIntegrityBundleGateItem = Omit<EvidenceIntegrityBundleGateResult["items"][number], "defined">;

export const EVIDENCE_INTEGRITY_BUNDLE_GATE_ITEMS: EvidenceIntegrityBundleGateItem[] = [
  { itemId: "BUNDLED_RC_LOCK", label: "Bundled RC lock present", required: true },
  { itemId: "BUNDLED_VERIFY_SCRIPT", label: "Bundled verify script registered", required: true },
  { itemId: "LEGAL_RELIABILITY_CROSS_LINK", label: "Legal Reliability RC cross-link", required: true },
];
