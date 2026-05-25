/**
 * Product Phase 42-C — AiExtractToSourceLinkage SSOT.
 */
import type { AiExtractToSourceLinkageResult } from "./ai-extract-to-source-linkage.schema";

export const AI_EXTRACT_TO_SOURCE_LINKAGE_REGISTRY_MARKER_42C =
  "phase42c-ai-extract-to-source-linkage-registry" as const;

export const EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG = "evidence-integrity-001" as const;

type AiExtractToSourceLinkageItem = Omit<AiExtractToSourceLinkageResult["items"][number], "defined">;

export const AI_EXTRACT_TO_SOURCE_LINKAGE_ITEMS: AiExtractToSourceLinkageItem[] = [
  { itemId: "AI_EXTRACTED_TEXT_LINKED", label: "AI extracted text linked to source", required: true },
  { itemId: "PAGE_REFERENCE", label: "Page reference anchor", required: true },
  { itemId: "PARAGRAPH_REFERENCE", label: "Paragraph reference anchor", required: true },
  { itemId: "TIMESTAMP_REFERENCE", label: "Timestamp reference anchor", required: true },
  { itemId: "EXTRACT_LAWYER_REVIEW", label: "Lawyer review of extract linkage", required: true },
];
