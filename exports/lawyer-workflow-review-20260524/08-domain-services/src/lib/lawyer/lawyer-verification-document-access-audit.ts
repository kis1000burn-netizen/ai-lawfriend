/**
 * P5: `LAWYER_VERIFICATION_DOCUMENT_ACCESS` 감사 metadata 표준.
 * 전체 URL·signed URL·storageKey 값은 넣지 않는다.
 */

export const LAWYER_VERIFICATION_DOCUMENT_ACCESS_META_VERSION = 1 as const;

/** 관리자 열람 리다이렉트 종류(고정 문자열). */
export type LawyerVerificationDocumentAccessMode =
  | "signed_redirect"
  | "local_content_token"
  | "legacy_access";

export type LawyerVerificationDocumentAccessAuditMetadata = {
  schemaVersion: typeof LAWYER_VERIFICATION_DOCUMENT_ACCESS_META_VERSION;
  lawyerProfileId: string;
  documentId: string;
  verificationDocumentType: string;
  accessMode: LawyerVerificationDocumentAccessMode;
  /** storageKey 기반 분기에서만 true (실제 키 문자열은 기록하지 않음) */
  hasStorageKey: boolean;
  /** presign·Supabase signed·로컬 토큰 URL에 공통 적용되는 TTL(초). legacy 제외. */
  signedUrlTtlSec?: number;
  /** legacy http(s) 리다이렉트만. 호스트만 기록. */
  legacyUrlHost?: string | null;
};

/** 감사용: legacy URL 전체를 남기지 않고 hostname 만 추출. */
export function legacyLawyerVerificationUrlHostForAudit(fileUrl: string): string | null {
  const u = fileUrl.trim();
  try {
    const h = new URL(u).hostname;
    return h.length > 0 ? h.slice(0, 253) : null;
  } catch {
    return null;
  }
}

export function buildLawyerVerificationDocumentAccessAuditMetadata(input: {
  lawyerProfileId: string;
  documentId: string;
  verificationDocumentType: string;
  accessMode: LawyerVerificationDocumentAccessMode;
  hasStorageKey: boolean;
  signedUrlTtlSec?: number;
  legacyUrlHost?: string | null;
}): LawyerVerificationDocumentAccessAuditMetadata {
  const meta: LawyerVerificationDocumentAccessAuditMetadata = {
    schemaVersion: LAWYER_VERIFICATION_DOCUMENT_ACCESS_META_VERSION,
    lawyerProfileId: input.lawyerProfileId,
    documentId: input.documentId,
    verificationDocumentType: input.verificationDocumentType,
    accessMode: input.accessMode,
    hasStorageKey: input.hasStorageKey,
  };
  if (input.signedUrlTtlSec !== undefined) {
    meta.signedUrlTtlSec = input.signedUrlTtlSec;
  }
  if (input.legacyUrlHost !== undefined) {
    meta.legacyUrlHost = input.legacyUrlHost;
  }
  return meta;
}
