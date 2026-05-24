/**
 * Phase 13-D — citation helpers (every extracted item must cite source).
 */
import type { ExtractedPage } from "./document-extraction.schema";
import type { AnalysisCitation } from "./document-analysis.schema";

export const PHASE13D_DOCUMENT_ANALYSIS_CITATION_MARKER =
  "PHASE13D_DOCUMENT_ANALYSIS_CITATION" as const;

export function buildCitationFromPage(
  page: ExtractedPage,
  reason: string,
  snippetLength = 120,
): AnalysisCitation {
  const trimmed = page.text.trim();
  const snippet =
    trimmed.length > snippetLength
      ? `${trimmed.slice(0, snippetLength)}…`
      : trimmed || "(본문 없음)";

  return {
    pageNumber: page.pageNumber,
    snippet,
    reason,
  };
}

export function findPageContainingText(
  pages: ExtractedPage[],
  needle: string,
): ExtractedPage | undefined {
  const normalized = needle.trim().slice(0, 40);
  if (!normalized) return pages[0];

  return (
    pages.find((p) => p.text.includes(normalized)) ??
    pages.find((p) => p.text.trim().length > 0) ??
    pages[0]
  );
}

export function citationFromMatch(
  pages: ExtractedPage[],
  matchedText: string,
  reason: string,
): AnalysisCitation {
  const page = findPageContainingText(pages, matchedText) ?? pages[0];
  if (!page) {
    return { pageNumber: 1, snippet: matchedText.slice(0, 120), reason };
  }
  const idx = page.text.indexOf(matchedText.slice(0, 30));
  const snippet =
    idx >= 0
      ? page.text.slice(idx, idx + 120)
      : page.text.slice(0, 120);
  return {
    pageNumber: page.pageNumber,
    snippet: snippet.trim() || matchedText.slice(0, 120),
    reason,
  };
}
