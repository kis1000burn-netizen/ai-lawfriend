import { describe, expect, it } from "vitest";
import {
  extractedTextPayloadSchema,
  litigationExtractedTextResponseSchema,
} from "./document-extraction.schema";

describe("document-extraction.schema (Phase 13-B)", () => {
  it("parses extracted text API response shape", () => {
    const parsed = litigationExtractedTextResponseSchema.parse({
      fileId: "clhse9v6n0000qz0123456789",
      caseId: "clhse9v6n0001qz0123456789",
      originalFileName: "피고답변서.pdf",
      mimeType: "application/pdf",
      extractionStatus: "EXTRACTED",
      pageCount: 2,
      extractionQualityScore: 0.96,
      pages: [
        { pageNumber: 1, text: "서울중앙지방법원", confidence: 0.98 },
        { pageNumber: 2, text: "피고는 원고의 청구를 다툽니다.", confidence: 0.95 },
      ],
    });
    expect(parsed.pages).toHaveLength(2);
  });

  it("parses extraction payload with quality flags", () => {
    const parsed = extractedTextPayloadSchema.parse({
      version: "13-B.1",
      extractionMethod: "NATIVE",
      pages: [{ pageNumber: 1, text: "hello", confidence: 0.99 }],
      qualityScore: 0.99,
      qualityFlags: ["DOCX_SINGLE_PAGE"],
    });
    expect(parsed.qualityFlags).toContain("DOCX_SINGLE_PAGE");
  });
});
