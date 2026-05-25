/**
 * Product Phase 47-F — ExplainabilityTraceBundleGate service.
 */
import { EXPLAINABILITY_TRACE_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./explainability-trace-bundle-gate.registry";
import { assembleExplainabilityTraceBundleGate } from "./explainability-trace-bundle-gate.policy";
import type { ExplainabilityTraceBundleGateResult } from "./explainability-trace-bundle-gate.schema";

export const EXPLAINABILITY_TRACE_BUNDLE_GATE_SERVICE_MARKER_47F =
  "phase47f-explainability-trace-bundle-gate-service" as const;

export function buildExplainabilityTraceBundleGate(input?: {
  legalReliabilityScopeSlug?: string;
  definedItemIds?: string[];
}): ExplainabilityTraceBundleGateResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      EXPLAINABILITY_TRACE_BUNDLE_GATE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleExplainabilityTraceBundleGate({
    legalReliabilityScopeSlug:
      input?.legalReliabilityScopeSlug ?? LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
