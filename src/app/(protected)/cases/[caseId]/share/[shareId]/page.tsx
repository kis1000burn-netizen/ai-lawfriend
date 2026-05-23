import Link from "next/link";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { CasePackageShareDetailClient } from "@/components/case-package/case-package-share-detail-client";

type PageProps = {
  params: Promise<{
    caseId: string;
    shareId: string;
  }>;
};

export default async function CasePackageShareDetailPage({ params }: PageProps) {
  const { caseId, shareId } = await params;

  const sessionUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(sessionUser);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">AI법친 사건 패키지</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-aibeop-text">
              공유 상세 및 열람 이력
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-aibeop-muted">
              변호사에게 공유한 사건 패키지의 상태, 공유 범위, 열람 및
              다운로드 이력을 확인합니다. 공유가 더 이상 필요하지 않으면 즉시
              취소할 수 있습니다.
            </p>
          </div>

          <Link
            href={`/cases/${caseId}/share`}
            className="rounded-xl border px-4 py-2 text-center text-sm font-semibold text-aibeop-subtle hover:bg-slate-50"
          >
            공유 목록으로 돌아가기
          </Link>
        </div>
      </section>

      <CasePackageShareDetailClient caseId={caseId} shareId={shareId} />
    </main>
  );
}