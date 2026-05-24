import type { SessionUser } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/errors";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";
import { requireSessionUser } from "@/lib/auth/require-session-user";

/** Legal Knowledge Lawyer Review 등 변호사 전용 API — LAWYER + verification APPROVED */
export async function requireApprovedLawyerApi(): Promise<SessionUser> {
  const user = await requireSessionUser();

  if (user.role !== "LAWYER") {
    throw new ForbiddenError("변호사(LAWYER) 권한이 필요합니다.");
  }

  await assertLawyerProfessionalAccess(user);
  return user;
}
