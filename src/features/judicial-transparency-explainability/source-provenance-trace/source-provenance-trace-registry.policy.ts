/**
 * Product Phase 45-A — SourceProvenanceTraceRegistry policy SSOT.
 */
import { SOURCE_PROVENANCE_TRACE_REGISTRY_ITEMS, JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG } from "./source-provenance-trace-registry.registry";
import type { SourceProvenanceTraceRegistryResult } from "./source-provenance-trace-registry.schema";
import { SOURCE_PROVENANCE_TRACE_REGISTRY_VERSION } from "./source-provenance-trace-registry.schema";

export const SOURCE_PROVENANCE_TRACE_REGISTRY_POLICY_MARKER_45A =
  "phase45a-source-provenance-trace-registry-policy" as const;

export const SOURCE_PROVENANCE_TRACE_REGISTRY_GATE_MARKER_45A =
  "phase45a-source-provenance-trace-registry-gate" as const;


export function assembleSourceProvenanceTraceRegistry(input: {
  explainabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): SourceProvenanceTraceRegistryResult {
  const items = SOURCE_PROVENANCE_TRACE_REGISTRY_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: SOURCE_PROVENANCE_TRACE_REGISTRY_VERSION,
    explainabilityScopeSlug: input.explainabilityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    sourceProvenanceTraceRegistryReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
