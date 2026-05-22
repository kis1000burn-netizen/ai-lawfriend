/**
 * 운영·SEO 근거 요약:
 * - 유입형 공개 랜딩은 허용하고 크롤 예산을 그쪽으로 집중.
 * - `/login`·`/signup` 접두는 가입/로그인 계열(예: `/signup-lawyer`)까지 차단해 얇은 페이지 색인을 줄임.
 * - 사건·문서·대시보드·변호사/관리자 영역·API 는 세션·권한 경로 → 명시적 Disallow.
 * 미들웨어 밖 경로라도 검색엔진에 로그인 리다이렉트 URL이 도드라지지 않게 완화.
 */
export const ROBOTS_DISALLOW_PREFIXES = [
  "/admin/",
  "/api/",
  "/cases/",
  "/dashboard/",
  "/documents/",
  "/lawyer/",
  "/login",
  "/signup",
] as const;
