/**
 * Product Phase 47-F — ExplainabilityTraceBundleGate policy SSOT.
 */
import { EXPLAINABILITY_TRACE_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./explainability-trace-bundle-gate.registry";
import type { ExplainabilityTraceBundleGateResult } from "./explainability-trace-bundle-gate.schema";
import { EXPLAINABILITY_TRACE_BUNDLE_GATE_VERSION } from "./explainability-trace-bundle-gate.schema";

export const EXPLAINABILITY_TRACE_BUNDLE_GATE_POLICY_MARKER_47F =
  "phase47f-explainability-trace-bundle-gate-policy" as const;

export const EXPLAINABILITY_TRACE_BUNDLE_GATE_GATE_MARKER_47F =
  "phase47f-explainability-trace-bundle-gate-gate" as const;

export const LEGAL_RELIABILITY_BUNDLED_PHASE_45F =
  "45-F" as const;

export function assembleExplainabilityTraceBundleGate(input: {
  legalReliabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): ExplainabilityTraceBundleGateResult {
  const items = EXPLAINABILITY_TRACE_BUNDLE_GATE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: EXPLAINABILITY_TRACE_BUNDLE_GATE_VERSION,
    legalReliabilityScopeSlug: input.legalReliabilityScopeSlug,
    bundledPhase: "45-F",
    bundledVerifyScript: "verify:aibeopchin-judicial-transparency-explainability-rc",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    explainabilityTraceBundleGateReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
