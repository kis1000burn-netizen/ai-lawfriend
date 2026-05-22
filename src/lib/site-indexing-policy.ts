/**
 * 검색엔진 색인 허용 여부. robots.txt·동적 sitemap에서 공통 사용.
 */
export function isSearchIndexingBlocked(): boolean {
  if (process.env.ROBOTS_DISALLOW_ALL === "true") return true;

  const vercel = process.env.VERCEL_ENV;
  if (vercel === "preview" || vercel === "development") return true;

  const appEnv = process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase();
  if (appEnv === "staging") return true;

  return false;
}
