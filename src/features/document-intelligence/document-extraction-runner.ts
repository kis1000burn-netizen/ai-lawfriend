/**
 * Phase 13-B — text extraction runner (PDF/DOCX/TXT/image OCR boundary).
 * No legal analysis — read-only text extraction only.
 */
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import type { LitigationExtractionMethod } from "@prisma/client";
import type { ExtractedPage } from "./document-extraction.schema";
import type { LitigationQualityFlag } from "./document-extraction-quality.types";
import {
  computePageConfidenceFromText,
  computeExtractionQualityScore,
} from "./document-extraction-quality";
import { DOCUMENT_INTELLIGENCE_EXTRACTION_VERSION } from "./document-extraction.schema";

export const PHASE13B_DOCUMENT_EXTRACTION_RUNNER_MARKER =
  "PHASE13B_DOCUMENT_EXTRACTION_RUNNER" as const;

export type ExtractionRunResult = {
  version: typeof DOCUMENT_INTELLIGENCE_EXTRACTION_VERSION;
  extractionMethod: LitigationExtractionMethod;
  pages: ExtractedPage[];
  qualityScore: number;
  qualityFlags: LitigationQualityFlag[];
};

async function extractFromPdf(buffer: Buffer): Promise<ExtractionRunResult> {
  const parser = new PDFParse({ data: buffer });
  try {
    const textResult = await parser.getText();
    const qualityFlags: LitigationQualityFlag[] = [];

    let pages: ExtractedPage[] = textResult.pages.map((page) => ({
      pageNumber: page.num,
      text: page.text,
      confidence: computePageConfidenceFromText(page.text, 0.96),
    }));

    if (pages.length === 0 && textResult.text.trim()) {
      pages = [
        {
          pageNumber: 1,
          text: textResult.text,
          confidence: computePageConfidenceFromText(textResult.text, 0.96),
        },
      ];
      qualityFlags.push("PDF_PAGE_BOUNDARY_APPROXIMATE");
    }

    if (!textResult.text.trim()) {
      qualityFlags.push("EMPTY_TEXT");
    }

    if (pages.length === 0) {
      pages.push({ pageNumber: 1, text: "", confidence: 0 });
    }

    return finalizeResult("NATIVE", pages, qualityFlags);
  } finally {
    await parser.destroy();
  }
}

async function extractFromDocx(buffer: Buffer): Promise<ExtractionRunResult> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value ?? "";
  const qualityFlags: LitigationQualityFlag[] = ["DOCX_SINGLE_PAGE"];
  if (!text.trim()) qualityFlags.push("EMPTY_TEXT");

  const pages: ExtractedPage[] = [
    {
      pageNumber: 1,
      text,
      confidence: computePageConfidenceFromText(text, 0.97),
    },
  ];

  return finalizeResult("NATIVE", pages, qualityFlags);
}

function extractFromPlainText(buffer: Buffer): ExtractionRunResult {
  const text = buffer.toString("utf8");
  const qualityFlags: LitigationQualityFlag[] = [];
  if (!text.trim()) qualityFlags.push("EMPTY_TEXT");

  const pages: ExtractedPage[] = [
    {
      pageNumber: 1,
      text,
      confidence: computePageConfidenceFromText(text, 0.99),
    },
  ];

  return finalizeResult("PLAIN_TEXT", pages, qualityFlags);
}

function extractFromImageBoundary(): ExtractionRunResult {
  const pages: ExtractedPage[] = [{ pageNumber: 1, text: "", confidence: 0 }];
  return finalizeResult("OCR", pages, ["OCR_NOT_CONFIGURED", "EMPTY_TEXT"]);
}

function finalizeResult(
  extractionMethod: LitigationExtractionMethod,
  pages: ExtractedPage[],
  qualityFlags: LitigationQualityFlag[],
): ExtractionRunResult {
  const qualityScore = computeExtractionQualityScore({ pages, qualityFlags });
  return {
    version: DOCUMENT_INTELLIGENCE_EXTRACTION_VERSION,
    extractionMethod,
    pages,
    qualityScore,
    qualityFlags,
  };
}

export async function runDocumentTextExtraction(params: {
  mimeType: string;
  buffer: Buffer;
}): Promise<ExtractionRunResult> {
  const { mimeType, buffer } = params;

  if (mimeType === "application/pdf") {
    return extractFromPdf(buffer);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return extractFromDocx(buffer);
  }

  if (mimeType === "text/plain") {
    return extractFromPlainText(buffer);
  }

  if (
    mimeType === "image/png" ||
    mimeType === "image/jpeg" ||
    mimeType === "image/webp"
  ) {
    return extractFromImageBoundary();
  }

  throw new Error(`지원하지 않는 MIME 유형입니다: ${mimeType}`);
}
