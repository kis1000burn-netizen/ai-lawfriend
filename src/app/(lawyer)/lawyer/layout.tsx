import type { ReactNode } from "react";
import Link from "next/link";
import { requireLawyer } from "@/lib/auth/session";
import { canManageQuestionSets } from "@/features/question-set/question-set.service";
import AuthStatus from "@/components/auth/auth-status";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import { ProtectedPageWayfinding } from "@/components/layout/protected-page-wayfinding";
import { prisma } from "@/lib/prisma";

type Props = {
  children: ReactNode;
};

export default async function LawyerLayout({ children }: Props) {
  const user = await requireLawyer();

  const lawyerProfile = await prisma.lawyerProfile.findUnique({
    where: { userId: user.id },
    select: { verificationStatus: true },
  });
  const lawyerApproved = lawyerProfile?.verificationStatus === "APPROVED";
  const lawyerHomeHref = lawyerApproved
    ? "/lawyer"
    : "/lawyer/verification-pending";

  return (
    <div className="min-h-screen bg-aibeop-bg text-aibeop-text">
      <header className="border-b border-aibeop-line bg-aibeop-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-3">
            <AibeopchinLogo href={lawyerHomeHref} compact />
            <div className="text-sm font-bold text-aibeop-text">변호사 포털</div>
            <div className="text-sm font-bold text-aibeop-subtle">권한: {user.role}</div>
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-aibeop-subtle">
              <Link href={lawyerHomeHref} className="hover:text-aibeop-deep">
                홈
              </Link>
              <Link href="/lawyer/case-packages/lookup" className="hover:text-aibeop-deep">
                사건 고유번호 조회
              </Link>
              {lawyerApproved ? (
                <Link
                  href="/lawyer/legal-knowledge/reviews"
                  className="hover:text-aibeop-deep"
                >
                  공부호 Legal Knowledge 검수
                </Link>
              ) : null}
              {canManageQuestionSets(user.role) ? (
                <Link href="/admin/question-sets" className="hover:text-aibeop-deep">
                  인터뷰 질문셋
                </Link>
              ) : null}
              {lawyerApproved ? (
                <Link href="/dashboard" className="hover:text-aibeop-deep">
                  의뢰인 대시보드
                </Link>
              ) : null}
            </nav>
          </div>
          <AuthStatus user={user} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <ProtectedPageWayfinding homeHref="/lawyer" homeLabel="변호사 홈" scope="lawyer" />
        {children}
      </main>
    </div>
  );
}
