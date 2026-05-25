/**
 * Product Phase 45-A — SourceProvenanceTraceRegistry service.
 */
import {
  JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
  SOURCE_PROVENANCE_TRACE_REGISTRY_ITEMS,
} from "./source-provenance-trace-registry.registry";
import { assembleSourceProvenanceTraceRegistry } from "./source-provenance-trace-registry.policy";
import type { SourceProvenanceTraceRegistryResult } from "./source-provenance-trace-registry.schema";

export const SOURCE_PROVENANCE_TRACE_REGISTRY_SERVICE_MARKER_45A =
  "phase45a-source-provenance-trace-registry-service" as const;

export function buildSourceProvenanceTraceRegistry(input?: {
  explainabilityScopeSlug?: string;
  definedItemIds?: string[];
}): SourceProvenanceTraceRegistryResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      SOURCE_PROVENANCE_TRACE_REGISTRY_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleSourceProvenanceTraceRegistry({
    explainabilityScopeSlug:
      input?.explainabilityScopeSlug ?? JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
