/**
 * Auth / OAuth flow 쿠키의 Secure 플래그.
 * `NODE_ENV === "production"`만으로 true로 두면, HTTP(내부망·임시 도메인) 배포에서
 * 브라우저가 Set-Cookie를 무시해 로그인 직후 세션이 잡히지 않는 경우가 있다.
 *
 * - `AUTH_COOKIE_SECURE=true|false` 로 강제 가능
 * - 미설정 시 `APP_BASE_URL` 이 `https://` 이면 secure, `http://` 이면 비secure
 * - 그 외(빈 문자열 등)는 기존과 같이 production 에서만 secure
 */
export function isAuthCookieSecure(): boolean {
  const explicit = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase();
  if (explicit === "false" || explicit === "0") return false;
  if (explicit === "true" || explicit === "1") return true;

  const base = process.env.APP_BASE_URL?.trim() ?? "";
  if (base.startsWith("https://")) return true;
  if (base.startsWith("http://")) return false;

  return process.env.NODE_ENV === "production";
}

/** 세션·OAuth state 등 인증 관련 쿠키 — 발급/삭제 시 동일한 path·sameSite·secure 를 맞춘다. */
export function authSessionCookieSetOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: isAuthCookieSecure(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function authSessionCookieClearOptions() {
  return {
    httpOnly: true,
    secure: isAuthCookieSecure(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
