import type { PublishedDocumentTemplateRecord } from "@/lib/document-template-repository";

/** 문서 생성 프롬프트에 넣을 LegalFormSource.parsedText 상한(문자 단위 근사). */
export const DEFAULT_OFFICIAL_FORM_PROMPT_TEXT_MAX_CHARS = 14_000;

function resolveMaxParsedTextChars(override?: number): number {
  if (typeof override === "number" && Number.isFinite(override) && override > 0) {
    return Math.floor(override);
  }
  const env = Number(process.env.DOC_GEN_OFFICIAL_FORM_TEXT_MAX_CHARS);
  if (Number.isFinite(env) && env > 0) {
    return Math.floor(env);
  }
  return DEFAULT_OFFICIAL_FORM_PROMPT_TEXT_MAX_CHARS;
}

export function excerptOfficialFormParsedText(
  parsedText: string | null | undefined,
  maxCharsOverride?: number,
): { excerpt: string | null; truncated: boolean; totalChars: number } {
  if (parsedText == null || typeof parsedText !== "string") {
    return { excerpt: null, truncated: false, totalChars: 0 };
  }
  const t = parsedText.trim();
  if (!t) {
    return { excerpt: null, truncated: false, totalChars: 0 };
  }

  const maxChars = resolveMaxParsedTextChars(maxCharsOverride);
  const totalChars = t.length;

  if (totalChars <= maxChars) {
    return { excerpt: t, truncated: false, totalChars };
  }

  return {
    excerpt: `${t.slice(0, maxChars)}\n\n[… 이하 생략 · 전체 ${totalChars}자]`,
    truncated: true,
    totalChars,
  };
}

/** 문서 생성 프롬프트용 공식 출처 요약(trace 메타만 JSON, 원문 발췌는 별도 블록). */
export type OfficialFormGenerationTracePayload = Record<string, unknown>;

export type OfficialFormGenerationContext = {
  officialFormTrace: OfficialFormGenerationTracePayload;
  officialFormParsedTextExcerpt: string | null;
};

export function buildOfficialFormGenerationContext(
  templateRecord: PublishedDocumentTemplateRecord,
  excerptOptions?: { maxParsedTextChars?: number },
): OfficialFormGenerationContext {
  const source = templateRecord.source;
  const { excerpt, truncated, totalChars } = excerptOfficialFormParsedText(
    source?.parsedText ?? null,
    excerptOptions?.maxParsedTextChars,
  );

  const officialFormTrace: OfficialFormGenerationTracePayload = {
    templateId: templateRecord.id,
    templateCode: templateRecord.code,
    templateVersion: templateRecord.version,
    templateTitle: templateRecord.title,
    sourceProvider: templateRecord.sourceProvider,
    sourceId: templateRecord.sourceId ?? null,
    sourceName: source?.sourceName ?? null,
    sourceUrl: templateRecord.sourceUrl ?? source?.sourceUrl ?? null,
    sourceHash: templateRecord.sourceHash ?? source?.fileHash ?? null,
    sourceStatus: source?.status ?? null,
    officialFormCode: source?.officialFormCode ?? null,
    effectiveDate:
      source?.effectiveDate instanceof Date ? source.effectiveDate.toISOString() : null,
    sourceParsedTextTotalChars: totalChars,
    sourceParsedTextTruncated: truncated,
    licenseNotePresent: Boolean(source?.licenseNote?.trim()),
  };

  return {
    officialFormTrace,
    officialFormParsedTextExcerpt: excerpt,
  };
}
