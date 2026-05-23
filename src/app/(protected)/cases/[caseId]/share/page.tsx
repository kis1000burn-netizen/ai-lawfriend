import Link from "next/link";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { CasePackageShareClient } from "@/components/case-package/case-package-share-client";

type PageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function CasePackageSharePage({ params }: PageProps) {
  const { caseId } = await params;

  const sessionUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(sessionUser);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">AI법친 사건 패키지</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-aibeop-text">
              변호사 검토용 사건 공유 설정
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-aibeop-muted">
              사건 요약, AI 인터뷰 정리, 첨부자료 목록, 문서 초안의 기초를
              변호사가 검토할 수 있도록 공유 범위와 만료일을 설정합니다.
              <span className="font-medium text-aibeop-subtle">
                {" "}
                고유번호를 발급하는 순간 현재 사건 패키지가 스냅샷으로 고정되며, 이후 의뢰인이
                사건을 수정해도 이 공유로 열람되는 내용은 발급 당시 기준으로 유지됩니다.
              </span>
              고유번호만으로는 열람되지 않으며, 변호사 로그인과 공유 상태
              검증을 거쳐야 합니다.
            </p>
          </div>

          <Link
            href={`/cases/${caseId}`}
            className="rounded-xl border px-4 py-2 text-center text-sm font-semibold text-aibeop-subtle hover:bg-slate-50"
          >
            사건 상세로 돌아가기
          </Link>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong>중요 안내:</strong> AI법친 사건 패키지는 법률 자문이나
          최종 문서가 아닙니다. 의뢰인이 입력한 사실관계와 자료를 변호사
          검토용으로 정리한 자료이며, 최종 법률 판단은 변호사 또는 적법한
          전문가가 수행해야 합니다.
        </div>
      </div>

      <CasePackageShareClient caseId={caseId} />
    </main>
  );
}