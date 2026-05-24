/**
 * Product Phase 21-B — Mobile client portal upload policy (limits · capture · failure meta).
 */
import {
  ALLOWED_LITIGATION_MIME_TYPES,
  MAX_LITIGATION_FILES_PER_CASE,
  MAX_LITIGATION_UPLOAD_BYTES,
} from "@/features/document-intelligence/document-upload.schema";

export const CLIENT_MOBILE_UPLOAD_POLICY_MARKER_PHASE21B =
  "phase21b-client-mobile-upload-policy" as const;

export const CLIENT_PORTAL_MOBILE_CAMERA_CAPTURE = "environment" as const;

export const CLIENT_PORTAL_MOBILE_UPLOAD_ACCEPT = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
].join(",");

export const CLIENT_PORTAL_MOBILE_UPLOAD_FAILURE_CODES = [
  "EMPTY_FILE",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_MIME",
  "NETWORK_ERROR",
  "SERVER_REJECTED",
  "CASE_FILE_LIMIT",
] as const;

export type ClientPortalMobileUploadFailureCode =
  (typeof CLIENT_PORTAL_MOBILE_UPLOAD_FAILURE_CODES)[number];

export type ClientPortalMobileUploadValidationResult =
  | { ok: true }
  | { ok: false; reason: string; failureCode: ClientPortalMobileUploadFailureCode };

export const CLIENT_PORTAL_MOBILE_UPLOAD_DEPARTURE_WARNING =
  "파일 업로드가 진행 중입니다. 페이지를 나가면 업로드가 중단될 수 있습니다." as const;

export const CLIENT_PORTAL_MOBILE_UPLOAD_MONITORING_DOMAIN =
  "client_portal_upload" as const;

export function formatClientPortalMobileUploadLimitGuide(): string {
  const mb = Math.round(MAX_LITIGATION_UPLOAD_BYTES / (1024 * 1024));
  const types = "PDF · Word · TXT · PNG · JPG · WEBP";
  return `파일당 최대 ${mb}MB · 사건당 ${MAX_LITIGATION_FILES_PER_CASE}개 · ${types}`;
}

export function validateClientPortalMobileUploadFile(file: File): ClientPortalMobileUploadValidationResult {
  if (!file || file.size <= 0) {
    return { ok: false, reason: "업로드할 파일을 선택해 주세요.", failureCode: "EMPTY_FILE" };
  }
  if (file.size > MAX_LITIGATION_UPLOAD_BYTES) {
    return {
      ok: false,
      reason: `파일 크기는 ${Math.round(MAX_LITIGATION_UPLOAD_BYTES / (1024 * 1024))}MB 이하여야 합니다.`,
      failureCode: "FILE_TOO_LARGE",
    };
  }
  if (!(ALLOWED_LITIGATION_MIME_TYPES as readonly string[]).includes(file.type)) {
    return {
      ok: false,
      reason: "지원하지 않는 파일 형식입니다. PDF·Word·이미지·TXT만 업로드할 수 있습니다.",
      failureCode: "UNSUPPORTED_MIME",
    };
  }
  return { ok: true };
}

export function maskClientPortalUploadFileName(fileName: string): string {
  const trimmed = fileName.trim();
  if (trimmed.length <= 8) return "***";
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-4)}`;
}

/** Metadata-only failure envelope — 17/18 triage · 19-B redaction · 19-D lifecycle cross-link. */
export function buildClientPortalMobileUploadFailureMeta(input: {
  failureCode: ClientPortalMobileUploadFailureCode;
  caseId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  httpStatus?: number;
}) {
  const retryEligible =
    input.failureCode === "NETWORK_ERROR" ||
    input.failureCode === "SERVER_REJECTED";

  return {
    domain: CLIENT_PORTAL_MOBILE_UPLOAD_MONITORING_DOMAIN,
    failureCode: input.failureCode,
    retryEligible,
    redactionPolicyVersion: "19-B",
    attachmentLifecyclePolicy: "19-D",
    caseId: input.caseId,
    fileNameMasked: maskClientPortalUploadFileName(input.fileName),
    mimeType: input.mimeType || "unknown",
    sizeBytes: input.sizeBytes,
    httpStatus: input.httpStatus ?? null,
    metadataOnly: true,
  };
}

export function mapServerUploadErrorToFailureCode(
  message: string,
  httpStatus?: number,
): ClientPortalMobileUploadFailureCode {
  if (message.includes("15MB") || message.includes("크기")) return "FILE_TOO_LARGE";
  if (message.includes("형식") || message.includes("지원")) return "UNSUPPORTED_MIME";
  if (message.includes("최대") && message.includes("개")) return "CASE_FILE_LIMIT";
  if (httpStatus && httpStatus >= 500) return "SERVER_REJECTED";
  return "SERVER_REJECTED";
}
