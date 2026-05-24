/**
 * Phase 13-B — extraction quality scoring (no legal analysis).
 */
import type { ExtractedPage } from "./document-extraction.schema";
import type { LitigationQualityFlag } from "./document-extraction-quality.types";

export { type LitigationQualityFlag } from "./document-extraction-quality.types";

export const PHASE13B_DOCUMENT_EXTRACTION_QUALITY_MARKER =
  "PHASE13B_DOCUMENT_EXTRACTION_QUALITY" as const;

export function computeExtractionQualityScore(params: {
  pages: ExtractedPage[];
  qualityFlags: LitigationQualityFlag[];
}): number {
  const { pages, qualityFlags } = params;

  if (qualityFlags.includes("ENCRYPTED")) return 0;
  if (pages.length === 0) return 0;

  const nonEmptyPages = pages.filter((p) => p.text.trim().length > 0);
  if (nonEmptyPages.length === 0) {
    return qualityFlags.includes("OCR_NOT_CONFIGURED") ? 0.05 : 0.1;
  }

  const avgConfidence =
    nonEmptyPages.reduce((sum, p) => sum + p.confidence, 0) / nonEmptyPages.length;

  let score = avgConfidence;

  if (qualityFlags.includes("PARTIAL_OCR")) score *= 0.75;
  if (qualityFlags.includes("LOW_RES")) score *= 0.85;
  if (qualityFlags.includes("BLUR")) score *= 0.8;
  if (qualityFlags.includes("MISSING_PAGES")) score *= 0.7;
  if (qualityFlags.includes("PDF_PAGE_BOUNDARY_APPROXIMATE")) score *= 0.95;
  if (qualityFlags.includes("DOCX_SINGLE_PAGE")) score *= 0.98;
  if (qualityFlags.includes("OCR_NOT_CONFIGURED")) score *= 0.2;
  if (qualityFlags.includes("EMPTY_TEXT")) score *= 0.15;

  const emptyRatio = 1 - nonEmptyPages.length / pages.length;
  score *= 1 - emptyRatio * 0.5;

  return Math.round(Math.max(0, Math.min(1, score)) * 100) / 100;
}

export function computePageConfidenceFromText(text: string, base = 0.98): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const replacementRatio =
    (trimmed.match(/[\uFFFD?]/g)?.length ?? 0) / Math.max(trimmed.length, 1);
  return Math.max(0.5, Math.min(1, base - replacementRatio * 2));
}
