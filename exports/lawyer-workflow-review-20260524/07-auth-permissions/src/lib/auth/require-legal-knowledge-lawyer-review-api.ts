import { getSessionUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/roles";

export type LegalKnowledgeLawyerReviewerRole =
  | "LAWYER"
  | "DELEGATED_LEGAL_REVIEWER";

export async function requireLegalKnowledgeLawyerReviewApi(): Promise<{
  user: SessionUser;
  reviewerRole: LegalKnowledgeLawyerReviewerRole;
}> {
  const user = await getSessionUser();

  if (!user) {
    const err = new Error("로그인이 필요합니다.") as Error & { status?: number };
    err.status = 401;
    throw err;
  }

  if (user.role === "LAWYER") {
    return { user, reviewerRole: "LAWYER" };
  }

  if (isAdminRole(user.role)) {
    return { user, reviewerRole: "DELEGATED_LEGAL_REVIEWER" };
  }

  const err = new Error(
    "변호사 검수 기록은 LAWYER 또는 ADMIN 이상 권한이 필요합니다.",
  ) as Error & { status?: number };
  err.status = 403;
  throw err;
}
