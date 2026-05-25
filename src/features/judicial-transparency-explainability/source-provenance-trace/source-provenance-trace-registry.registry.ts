/**
 * Product Phase 45-A — SourceProvenanceTraceRegistry SSOT.
 */
import type { SourceProvenanceTraceRegistryResult } from "./source-provenance-trace-registry.schema";

export const SOURCE_PROVENANCE_TRACE_REGISTRY_REGISTRY_MARKER_45A =
  "phase45a-source-provenance-trace-registry-registry" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG = "judicial-transparency-explainability-001" as const;

type SourceProvenanceTraceRegistryItem = Omit<SourceProvenanceTraceRegistryResult["items"][number], "defined">;

export const SOURCE_PROVENANCE_TRACE_REGISTRY_ITEMS: SourceProvenanceTraceRegistryItem[] = [
  { itemId: "EVIDENCE_USED_INDEX", label: "Evidence used index with hash trace", required: true },
  { itemId: "EXCLUDED_MATERIALS_LOG", label: "Excluded materials log with reason", required: true },
  { itemId: "SOURCE_CITATION_LINK", label: "Source citation link per output item", required: true },
  { itemId: "PROVENANCE_LAWYER_REVIEW", label: "Lawyer review of provenance trace", required: true },
];
