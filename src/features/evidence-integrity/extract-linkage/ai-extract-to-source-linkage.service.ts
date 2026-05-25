/**
 * Product Phase 42-C — AiExtractToSourceLinkage service.
 */
import {
  EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
  AI_EXTRACT_TO_SOURCE_LINKAGE_ITEMS,
} from "./ai-extract-to-source-linkage.registry";
import { assembleAiExtractToSourceLinkage } from "./ai-extract-to-source-linkage.policy";
import type { AiExtractToSourceLinkageResult } from "./ai-extract-to-source-linkage.schema";

export const AI_EXTRACT_TO_SOURCE_LINKAGE_SERVICE_MARKER_42C =
  "phase42c-ai-extract-to-source-linkage-service" as const;

export function buildAiExtractToSourceLinkage(input?: {
  evidenceIntegrityScopeSlug?: string;
  definedItemIds?: string[];
}): AiExtractToSourceLinkageResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      AI_EXTRACT_TO_SOURCE_LINKAGE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleAiExtractToSourceLinkage({
    evidenceIntegrityScopeSlug: input?.evidenceIntegrityScopeSlug ?? EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
