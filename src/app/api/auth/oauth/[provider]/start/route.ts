import { NextRequest, NextResponse } from "next/server";
import {
  buildOAuthAuthorizationUrl,
  createOAuthState,
  getOAuthFlowCookieNames,
  getOAuthProvider,
  normalizeAuthRedirectPath,
} from "@/lib/auth/oauth";
import { authSessionCookieSetOptions } from "@/lib/auth/cookie-security";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

function getOAuthCookieOptions() {
  return authSessionCookieSetOptions(60 * 10);
}

function redirectToLoginWithError(code: string) {
  const loginUrl = new URL("/login", env.APP_BASE_URL);
  loginUrl.searchParams.set("oauthError", code);
  return NextResponse.redirect(loginUrl);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const oauthProvider = getOAuthProvider(provider);

  if (!oauthProvider) {
    return redirectToLoginWithError("OAUTH_PROVIDER_UNAVAILABLE");
  }

  const state = createOAuthState();
  const redirectPath = normalizeAuthRedirectPath(
    req.nextUrl.searchParams.get("redirect"),
  );

  const response = NextResponse.redirect(
    buildOAuthAuthorizationUrl(oauthProvider, state),
  );

  const cookieNames = getOAuthFlowCookieNames(oauthProvider.key);
  const cookieOptions = getOAuthCookieOptions();

  response.cookies.set(cookieNames.state, state, cookieOptions);
  response.cookies.set(cookieNames.redirect, redirectPath, cookieOptions);

  return response;
}