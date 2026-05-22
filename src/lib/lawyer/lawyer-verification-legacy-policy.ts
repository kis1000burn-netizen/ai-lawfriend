/**
 * P4 legacy `fileUrl` 정책 — DB 컬럼명은 `fileUrl` 유지, 의미는 외부(legacy) 참조 URL.
 * 신규 경로는 `storageKey` 만 처리한다.
 */

/** http(s) 레거시 URL만 외부 열람으로 허용 */
export function isHttpLegacyLawyerVerificationFileUrl(url: string | null | undefined): boolean {
  const u = url?.trim();
  return !!u && /^https?:\/\//i.test(u);
}

/** 아직 private storage 로 이관되지 않은 레거시 행(http fileUrl, storageKey 없음). */
export function isLawyerVerificationLegacyExternalOnlyDoc(doc: {
  fileUrl?: string | null;
  storageKey?: string | null;
}): boolean {
  if (doc.storageKey?.trim()) return false;
  return isHttpLegacyLawyerVerificationFileUrl(doc.fileUrl);
}
