/**
 * Product Phase 47-F — ExplainabilityTraceBundleGate SSOT.
 */
import type { ExplainabilityTraceBundleGateResult } from "./explainability-trace-bundle-gate.schema";

export const EXPLAINABILITY_TRACE_BUNDLE_GATE_REGISTRY_MARKER_47F =
  "phase47f-explainability-trace-bundle-gate-registry" as const;

export const LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG = "legal-reliability-platform-001" as const;

type ExplainabilityTraceBundleGateItem = Omit<ExplainabilityTraceBundleGateResult["items"][number], "defined">;

export const EXPLAINABILITY_TRACE_BUNDLE_GATE_ITEMS: ExplainabilityTraceBundleGateItem[] = [
  { itemId: "BUNDLED_RC_LOCK", label: "Bundled RC lock present", required: true },
  { itemId: "BUNDLED_VERIFY_SCRIPT", label: "Bundled verify script registered", required: true },
  { itemId: "LEGAL_RELIABILITY_CROSS_LINK", label: "Legal Reliability RC cross-link", required: true },
];
