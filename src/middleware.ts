import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "@/lib/auth/jwt";
import { isAllowedStaffAdminPath } from "@/lib/auth/ops-admin-paths";
import { isAdminRole } from "@/lib/auth/roles";
import { getPostLoginHrefForSessionRole } from "@/lib/landing/post-login-href";

/**
 * [FILE-004] 보호 경로·쿠키·역할(변호사·STAFF `/admin` 예외)만 처리.
 * 사건 `CaseStatus`·`allowedLifecycleActions`·상태 전이는 API route에서(Batch A).
 */
function isAllowedLawyerAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin/question-sets" ||
    pathname.startsWith("/admin/question-sets/")
  );
}

const AUTH_COOKIE_NAME = "aibupchin_access_token";

const userProtectedPaths = ["/dashboard", "/cases"];
const lawyerProtectedPaths = ["/lawyer"];
const adminProtectedPaths = ["/admin"];
const guestOnlyPaths = ["/login", "/signup", "/signup-lawyer"];

function startsWithPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

async function getPayloadFromToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = await getPayloadFromToken(token);

  const isLoggedIn = !!payload;
  const role = typeof payload?.role === "string" ? payload.role : undefined;

  const isUserProtected = startsWithPath(pathname, userProtectedPaths);
  const isLawyerProtected = startsWithPath(pathname, lawyerProtectedPaths);
  const isAdminProtected = startsWithPath(pathname, adminProtectedPaths);
  const isGuestOnly = startsWithPath(pathname, guestOnlyPaths);

  if (
    (isUserProtected || isLawyerProtected || isAdminProtected) &&
    !isLoggedIn
  ) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly && isLoggedIn) {
    return NextResponse.redirect(
      new URL(getPostLoginHrefForSessionRole(role), req.url),
    );
  }

  if (isLawyerProtected && role !== "LAWYER") {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  if (isAdminProtected) {
    if (role && isAdminRole(role)) {
      return NextResponse.next();
    }
    if (role === "STAFF" && isAllowedStaffAdminPath(pathname)) {
      return NextResponse.next();
    }
    if (role === "LAWYER" && isAllowedLawyerAdminPath(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/cases",
    "/cases/:path*",
    "/lawyer",
    "/lawyer/:path*",
    "/admin",
    "/admin/:path*",
    "/login",
    "/signup",
    "/signup-lawyer",
  ],
};
