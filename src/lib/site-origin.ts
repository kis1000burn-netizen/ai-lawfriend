const FALLBACK_LOCAL = "http://localhost:3000";

/**
 * 검색·메타용 오리진 (스킴+호스트만). 경로·쿼리는 제거.
 * 우선순위: `APP_BASE_URL` → `NEXT_PUBLIC_APP_URL` → Vercel 호스트 → 로컬 기본값.
 */
export function siteOrigin(): string {
  const vercelHost = process.env.VERCEL_URL?.trim();
  const vercelOrigin = vercelHost ? `https://${vercelHost}` : "";

  const raw =
    process.env.APP_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    vercelOrigin;

  if (!raw) {
    return FALLBACK_LOCAL;
  }

  return normalizeToOrigin(raw);
}

function normalizeToOrigin(input: string): string {
  let s = input.trim();
  if (!s) {
    return FALLBACK_LOCAL;
  }

  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }

  try {
    const u = new URL(s);
    return u.origin;
  } catch {
    return FALLBACK_LOCAL;
  }
}
