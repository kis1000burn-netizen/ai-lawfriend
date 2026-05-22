import { ok } from "@/lib/domain-api-response";
import { authSessionCookieClearOptions } from "@/lib/auth/cookie-security";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = ok({ message: "로그아웃되었습니다." });

  response.cookies.set(AUTH_COOKIE_NAME, "", authSessionCookieClearOptions());

  return response;
}
