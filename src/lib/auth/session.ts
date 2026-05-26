import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole, UserStatus } from "@prisma/client";
import { isAccountStatusLoginAllowed, resolveLawyerVerificationApprovedForAuth } from "@/lib/commercial/post-deploy-promo-window.policy";
import { verifyAccessToken } from "./jwt";
import { prisma } from "@/lib/prisma";
import { hasRoleAtLeast } from "@/lib/auth/roles";

export const AUTH_COOKIE_NAME = "aibupchin_access_token";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    const userId = typeof payload.sub === "string" ? payload.sub : undefined;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) return null;
    if (!isAccountStatusLoginAllowed(user.status)) return null;

    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireLawyer() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "LAWYER") {
    redirect("/access-denied");
  }

  return user;
}

/** 변호사 **전문가(사건·보완요청 등)** 화면 — 승인(`APPROVED`) 전이면 승인 대기로 보낸다. */
export async function requireApprovedLawyer() {
  const user = await requireLawyer();
  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId: user.id },
    select: { verificationStatus: true },
  });
  if (!profile || !resolveLawyerVerificationApprovedForAuth({
    role: "LAWYER",
    verificationStatus: profile.verificationStatus,
  })) {
    redirect("/lawyer/verification-pending");
  }
  return user;
}

/**
 * 의뢰인 보호 경로 접근 시 `LAWYER`인데 등록 미승인이면 검증 대기로 보냅니다.
 * (`assertCaseAccess`만 적용되는 화면에서 전문가 검증 우회 방지.)
 */
export async function redirectLawyerToVerificationUnlessApproved(
  user: SessionUser,
): Promise<void> {
  if (user.role !== "LAWYER") return;

  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId: user.id },
    select: { verificationStatus: true },
  });

  if (!profile || !resolveLawyerVerificationApprovedForAuth({
    role: "LAWYER",
    verificationStatus: profile.verificationStatus,
  })) {
    redirect("/lawyer/verification-pending");
  }
}

export async function requireAdmin() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/access-denied");
  }

  return user;
}

/** 페이지용: 최소 역할 미만이면 `/dashboard`로 이동 */
export async function requireRolePage(minimumRole: UserRole) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasRoleAtLeast(user.role, minimumRole)) {
    redirect("/access-denied");
  }

  return user;
}
