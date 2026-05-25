/**
 * Product Phase 40-A — JudgmentCorpusSourceRegistry SSOT.
 */
import type { JudgmentCorpusSourceRegistryResult } from "./judgment-corpus-source-registry.schema";

export const JUDGMENT_CORPUS_SOURCE_REGISTRY_REGISTRY_MARKER_40A =
  "phase40a-judgment-corpus-source-registry-registry" as const;

export const JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "judgment-grounded-outcome-assessment-001" as const;

type JudgmentCorpusSourceRegistryItem = Omit<JudgmentCorpusSourceRegistryResult["items"][number], "defined">;

export const JUDGMENT_CORPUS_SOURCE_REGISTRY_ITEMS: JudgmentCorpusSourceRegistryItem[] = [
  { itemId: "OFFICIAL_JUDGMENT_SOURCE", label: "Official judgment source registry", required: true },
  { itemId: "LICENSED_DB_SOURCE", label: "Licensed judgment database source", required: true },
  { itemId: "INTERNAL_REVIEWED_SOURCE", label: "Internal reviewed judgment source", required: true },
  { itemId: "SOURCE_URL_LINKAGE", label: "Source URL and linkage metadata", required: true },
  { itemId: "COLLECTION_DATE_AUDIT", label: "Collection date audit trail", required: true },
  { itemId: "USAGE_SCOPE_POLICY", label: "Usage scope policy", required: true },
  { itemId: "ORIGINAL_VIEW_ACCESS", label: "Original text view access flag", required: true },
];
