import { describe, expect, it } from "vitest";
import {
  computeExtractionQualityScore,
  computePageConfidenceFromText,
} from "./document-extraction-quality";

describe("document-extraction-quality (Phase 13-B)", () => {
  it("scores high for clean native text pages", () => {
    const score = computeExtractionQualityScore({
      pages: [
        { pageNumber: 1, text: "서울중앙지방법원", confidence: 0.98 },
        { pageNumber: 2, text: "피고는 원고의 청구를 다툽니다.", confidence: 0.95 },
      ],
      qualityFlags: [],
    });
    expect(score).toBeGreaterThan(0.9);
  });

  it("penalizes OCR not configured", () => {
    const score = computeExtractionQualityScore({
      pages: [{ pageNumber: 1, text: "", confidence: 0 }],
      qualityFlags: ["OCR_NOT_CONFIGURED", "EMPTY_TEXT"],
    });
    expect(score).toBeLessThan(0.2);
  });

  it("computes page confidence from garbled chars", () => {
    expect(computePageConfidenceFromText("정상 텍스트")).toBeGreaterThan(0.9);
    expect(computePageConfidenceFromText("???")).toBeLessThan(0.9);
  });
});
