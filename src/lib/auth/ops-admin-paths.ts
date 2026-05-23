/**
 * STAFF가 접근 가능한 /admin 하위 경로(조회 전용).
 * `/admin/alerts/ops` 같은 느슨한 단일 접두사는 사용하지 않습니다.
 */
export const STAFF_ADMIN_ALLOWED_PREFIXES = [
  "/admin/alerts/ops-queue",
  "/admin/alerts/ops-dashboard",
  "/admin/audit-logs",
  "/admin/question-sets",
  /** `@/lib/definitions/permissions` STAFF 문서·질문셋 읽기와 정합 */
  "/admin/document-templates",
  "/admin/legal-form-sources",
  /** 의뢰인–변호사 공유 모니터링(`isCasePackageAdminUser`) */
  "/admin/case-package-shares",
  /** 변호사 자격 조회(STAFF)·심사 버튼은 ADMIN 전용 유지 */
  "/admin/lawyer-verifications",
  /** 공부호 패킷 목록·상세(Phase 4-A) — 조회 전용 */
  "/admin/gongbuho",
  /** Phase 7-A Voice transcript·privacy ops */
  "/admin/voice",
  /** Phase 6-E〜H CMB Preview · Operations Studio */
  "/admin/cmb",
] as const;

export function isAllowedStaffAdminPath(pathname: string): boolean {
  return STAFF_ADMIN_ALLOWED_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

/** @deprecated `STAFF_ADMIN_ALLOWED_PREFIXES`와 동일 */
export const STAFF_ALLOWED_ADMIN_PATH_PREFIXES = STAFF_ADMIN_ALLOWED_PREFIXES;

/** @deprecated `isAllowedStaffAdminPath` 사용 */
export function isStaffAllowedAdminPath(pathname: string): boolean {
  return isAllowedStaffAdminPath(pathname);
}
