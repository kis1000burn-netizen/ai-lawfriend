import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/get-session-user";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";

/**
 * 미승인 변호사가 `/admin/question-sets` 에 진입하지 못하게 한다.
 * (미들웨어는 LAWYER 를 이 경로로 허용하므로, 서버 레이아웃에서 자격 상태를 검사한다.)
 */
export default async function AdminQuestionSetsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  await redirectLawyerToVerificationUnlessApproved(user);

  return children;
}
