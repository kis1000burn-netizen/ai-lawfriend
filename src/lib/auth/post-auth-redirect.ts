import type { UserRole } from "@prisma/client";

import { getPostLoginHref } from "@/lib/landing/post-login-href";

/**
 * 저장된 리다이렉트가 “역할 무관 기본 홈”에만 해당할 때 역할별 작업실로 치환.
 * 구체 경로(`/cases/...`)는 유지합니다.
 */
const GENERIC_LOGIN_DESTINATIONS = new Set([
  "/dashboard",
  "/admin",
  "/lawyer",
]);

export type ResolvePostAuthRedirectInput = {
  /** `normalizeAuthRedirectPath` 등으로 정규화된 경로 */
  normalizedRequestPath: string;
  role: UserRole;
  lawyerVerificationApproved: boolean;
};

export function resolvePostAuthRedirect(input: ResolvePostAuthRedirectInput): string {
  const { normalizedRequestPath, role, lawyerVerificationApproved } = input;

  if (role === "LAWYER" && !lawyerVerificationApproved) {
    return "/lawyer/verification-pending";
  }

  if (!GENERIC_LOGIN_DESTINATIONS.has(normalizedRequestPath)) {
    return normalizedRequestPath;
  }

  return getPostLoginHref(role);
}
