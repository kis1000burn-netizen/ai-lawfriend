/**
 * Phase 13-B — document intelligence upload schema SSOT.
 */
import { z } from "zod";

export const PHASE13B_DOCUMENT_UPLOAD_MARKER = "PHASE13B_DOCUMENT_UPLOAD" as const;

export const DOCUMENT_INTELLIGENCE_UPLOAD_VERSION = "13-B.1" as const;

export const MAX_LITIGATION_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_LITIGATION_FILES_PER_CASE = 30;

export const ALLOWED_LITIGATION_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const allowedLitigationMimeTypeSchema = z.enum(ALLOWED_LITIGATION_MIME_TYPES);

export const litigationUploadParamsSchema = z.object({
  caseId: z.string().cuid(),
});

export const litigationFileParamsSchema = z.object({
  caseId: z.string().cuid(),
  fileId: z.string().cuid(),
});

export function validateLitigationUploadFile(file: File) {
  if (!file || file.size <= 0) {
    throw new Error("업로드할 파일을 선택해 주세요.");
  }
  if (file.size > MAX_LITIGATION_UPLOAD_BYTES) {
    throw new Error("파일 크기는 15MB 이하여야 합니다.");
  }
  const parsed = allowedLitigationMimeTypeSchema.safeParse(file.type);
  if (!parsed.success) {
    throw new Error("지원하지 않는 파일 형식입니다.");
  }
}
