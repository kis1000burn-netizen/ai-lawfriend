import { describe, expect, it } from "vitest";
import { runDocumentTextExtraction } from "./document-extraction-runner";

describe("document-extraction-runner (Phase 13-B)", () => {
  it("extracts plain text as single page", async () => {
    const buffer = Buffer.from("서울중앙지방법원\n피고는 원고의 청구를 다툽니다.", "utf8");
    const result = await runDocumentTextExtraction({
      mimeType: "text/plain",
      buffer,
    });
    expect(result.extractionMethod).toBe("PLAIN_TEXT");
    expect(result.pages[0]?.text).toContain("서울중앙지방법원");
    expect(result.qualityScore).toBeGreaterThan(0.8);
  });

  it("returns OCR boundary for images without legal analysis", async () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const result = await runDocumentTextExtraction({
      mimeType: "image/png",
      buffer,
    });
    expect(result.extractionMethod).toBe("OCR");
    expect(result.qualityFlags).toContain("OCR_NOT_CONFIGURED");
    expect(result.pages[0]?.text).toBe("");
  });
});
