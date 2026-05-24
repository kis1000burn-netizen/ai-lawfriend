/**
 * Phase 13-B — extraction output schema SSOT.
 */
import { z } from "zod";

export const PHASE13B_DOCUMENT_EXTRACTION_MARKER = "PHASE13B_DOCUMENT_EXTRACTION" as const;

export const DOCUMENT_INTELLIGENCE_EXTRACTION_VERSION = "13-B.1" as const;

export const LITIGATION_EXTRACTION_STATUS_VALUES = [
  "PENDING",
  "EXTRACTING",
  "EXTRACTED",
  "FAILED",
] as const;

export const litigationExtractionStatusSchema = z.enum(LITIGATION_EXTRACTION_STATUS_VALUES);

export const LITIGATION_EXTRACTION_METHOD_VALUES = [
  "NATIVE",
  "OCR",
  "HYBRID",
  "PLAIN_TEXT",
] as const;

export const litigationExtractionMethodSchema = z.enum(LITIGATION_EXTRACTION_METHOD_VALUES);

export const extractedPageSchema = z.object({
  pageNumber: z.number().int().positive(),
  text: z.string(),
  confidence: z.number().min(0).max(1),
});

export type ExtractedPage = z.infer<typeof extractedPageSchema>;

export const LITIGATION_QUALITY_FLAG_VALUES = [
  "BLUR",
  "MISSING_PAGES",
  "LOW_RES",
  "ENCRYPTED",
  "PARTIAL_OCR",
  "OCR_NOT_CONFIGURED",
  "DOCX_SINGLE_PAGE",
  "PDF_PAGE_BOUNDARY_APPROXIMATE",
  "EMPTY_TEXT",
] as const;

export const litigationQualityFlagSchema = z.enum(LITIGATION_QUALITY_FLAG_VALUES);

export const extractedTextPayloadSchema = z.object({
  version: z.literal(DOCUMENT_INTELLIGENCE_EXTRACTION_VERSION),
  extractionMethod: litigationExtractionMethodSchema,
  pages: z.array(extractedPageSchema).min(1),
  qualityScore: z.number().min(0).max(1),
  qualityFlags: z.array(litigationQualityFlagSchema).default([]),
});

export type ExtractedTextPayload = z.infer<typeof extractedTextPayloadSchema>;

/** API 응답 — 13-B는 법률 분석 없이 추출 결과만 */
export const litigationExtractedTextResponseSchema = z.object({
  fileId: z.string().cuid(),
  caseId: z.string().cuid(),
  originalFileName: z.string(),
  mimeType: z.string(),
  extractionStatus: litigationExtractionStatusSchema,
  pageCount: z.number().int().nonnegative(),
  extractionQualityScore: z.number().min(0).max(1).nullable(),
  revision: z.number().int().positive().optional(),
  extractionMethod: litigationExtractionMethodSchema.optional(),
  qualityFlags: z.array(litigationQualityFlagSchema).optional(),
  pages: z.array(extractedPageSchema).optional(),
  errorMessage: z.string().nullable().optional(),
});

export type LitigationExtractedTextResponse = z.infer<
  typeof litigationExtractedTextResponseSchema
>;

export function parseExtractedPagesFromJson(input: unknown): ExtractedPage[] {
  const pages = z.array(extractedPageSchema).parse(input);
  return pages;
}
