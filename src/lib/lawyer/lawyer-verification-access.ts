import type { LawyerVerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isPostDeployPromoWindowActive } from "@/lib/commercial/post-deploy-promo-window.policy";
import type { SessionUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";

export function isLawyerVerificationApproved(
  status: LawyerVerificationStatus | null | undefined,
): boolean {
  if (isPostDeployPromoWindowActive()) {
    return true;
  }
  return status === "APPROVED";
}

export async function getLawyerVerificationStatusForUser(
  userId: string,
): Promise<LawyerVerificationStatus | null> {
  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId },
    select: { verificationStatus: true },
  });
  return profile?.verificationStatus ?? null;
}

/**
 * 변호사 **전문가 기능** — `User.role === LAWYER` 인 경우에만 등록·승인(`APPROVED`)을 요구한다.
 * ADMIN·SUPER_ADMIN 등은 통과.
 */
export async function assertLawyerProfessionalAccess(user: SessionUser): Promise<void> {
  if (user.role !== "LAWYER") return;

  const status = await getLawyerVerificationStatusForUser(user.id);
  if (!isLawyerVerificationApproved(status)) {
    throw new AppError(
      "변호사 자격이 승인되기 전에는 이 기능을 사용할 수 없습니다. 제출 서류 검토 후 다시 시도해 주세요.",
      403,
      "LAWYER_VERIFICATION_REQUIRED",
    );
  }
}
