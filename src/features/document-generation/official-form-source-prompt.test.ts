import { describe, expect, it } from "vitest";
import {
  excerptOfficialFormParsedText,
  buildOfficialFormGenerationContext,
  DEFAULT_OFFICIAL_FORM_PROMPT_TEXT_MAX_CHARS,
} from "@/features/document-generation/official-form-source-prompt";
import type { PublishedDocumentTemplateRecord } from "@/lib/document-template-repository";

describe("official-form-source-prompt", () => {
  it("truncates parsed text beyond max chars", () => {
    const long = "가".repeat(DEFAULT_OFFICIAL_FORM_PROMPT_TEXT_MAX_CHARS + 50);
    const r = excerptOfficialFormParsedText(long, DEFAULT_OFFICIAL_FORM_PROMPT_TEXT_MAX_CHARS);
    expect(r.truncated).toBe(true);
    expect(r.excerpt?.length).toBeLessThanOrEqual(DEFAULT_OFFICIAL_FORM_PROMPT_TEXT_MAX_CHARS + 80);
    expect(r.totalChars).toBe(long.length);
  });

  it("buildOfficialFormGenerationContext embeds excerpt and omits excerpt from trace redundancy", () => {
    const rec = {
      id: "tid",
      code: "TST",
      version: "1",
      type: "STATEMENT",
      title: "Test",
      definitionJson: {},
      sourceProvider: "SCOURT",
      sourceId: "sid",
      sourceUrl: "https://example.org/f",
      sourceHash: null,
      sourceNote: null,
      catalogStatus: "PUBLISHED",
      publishedAt: new Date(),
      archivedAt: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: {
        id: "sid",
        provider: "SCOURT",
        sourceName: "법원",
        sourceUrl: "https://example.org/f",
        documentType: "STATEMENT",
        category: null,
        officialFormCode: "CV-01",
        fileName: null,
        fileMimeType: null,
        fileHash: "hashh",
        storageKey: null,
        licenseNote: "허용",
        downloadedAt: null,
        effectiveDate: null,
        parsedText: "서식 원문 안내 줄입니다.",
        status: "ACTIVE",
        memo: null,
        createdByUserId: null,
        updatedByUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as unknown as PublishedDocumentTemplateRecord;

    const { officialFormTrace, officialFormParsedTextExcerpt } =
      buildOfficialFormGenerationContext(rec);

    expect(officialFormParsedTextExcerpt).toContain("서식 원문");
    expect(officialFormTrace.officialFormCode).toBe("CV-01");
    expect(officialFormTrace.licenseNotePresent).toBe(true);
    expect((officialFormTrace as { sourceParsedTextExcerpt?: string }).sourceParsedTextExcerpt).toBeUndefined();
    expect((officialFormTrace as { sourceHash: unknown }).sourceHash).toBe("hashh");
  });
});
