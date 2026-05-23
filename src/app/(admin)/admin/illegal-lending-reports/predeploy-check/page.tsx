import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = {
  title: "불법사금융 모듈 배포 전 운영 점검 | AI법친 관리자",
};

export default async function IllegalLendingPredeployCheckPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/illegal-lending-reports"
          className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          ← 신고서 관리로 돌아가기
        </Link>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <p className="text-sm font-semibold text-cyan-300">
            AI법친 운영 점검
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            불법사금융 피해 신고서 모듈 배포 전 운영 점검
          </h1>

          <p className="mt-3 text-sm leading-7 text-aibeop-disabled">
            운영 배포 전 스토리지 버킷 권한, PDF 한글 폰트, 변호사 자동배정
            후보군을 확인합니다. 아래 API를 관리자 로그인 상태에서 호출해 결과를
            확인하세요.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <a
              href="/api/admin/illegal-lending-reports/predeploy-check"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-cyan-300/40 p-4 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
            >
              통합 점검 API 실행
            </a>

            <a
              href="/api/admin/illegal-lending-reports/predeploy/pdf-font-probe"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-purple-300/40 p-4 text-sm font-semibold text-purple-100 hover:bg-purple-300/10"
            >
              PDF 한글 폰트 점검 파일 다운로드
            </a>

            <a
              href="/api/admin/illegal-lending-reports/storage-health"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-slate-700 p-4 text-sm font-semibold text-slate-100 hover:bg-slate-800"
            >
              Storage Health 확인
            </a>

            <Link
              href="/admin/illegal-lending-reports"
              className="rounded-2xl border border-slate-700 p-4 text-sm font-semibold text-slate-100 hover:bg-slate-800"
            >
              신고서 목록 확인
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-950/30 p-4 text-sm leading-7 text-amber-100">
            통합 점검 API가 PASS여도 PDF 한글 출력은 반드시 다운로드한 PDF 파일을
            열어 육안으로 한글 깨짐 여부를 최종 확인해야 합니다.
          </div>
        </div>
      </div>
    </main>
  );
}