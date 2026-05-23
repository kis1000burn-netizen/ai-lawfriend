import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = {
  title: "무료 유입 서비스 홍보 QA | AI법친 관리자",
};

export default async function FreeServicePromoQaPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-cyan-300">AI법친 운영 QA</p>
        <h1 className="mt-2 text-3xl font-black">
          무료 유입 서비스 1·2호 홍보 노출 정책 QA
        </h1>
        <p className="mt-3 text-sm leading-7 text-aibeop-disabled">
          불법사금융·전세사기 무료 유입 서비스의 랜딩페이지, 공유 경로, 팝업
          노출 정책, GA/Meta 이벤트, OG 이미지를 운영 배포 전 점검합니다.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-xl font-bold">1호 불법사금융</h2>
            <div className="mt-4 grid gap-3">
              <Link
                href="/illegal-lending"
                target="_blank"
                className="rounded-xl border border-cyan-300/40 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
              >
                랜딩페이지 열기
              </Link>
              <Link
                href="/free/illegal-lending-report"
                target="_blank"
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800"
              >
                SNS 공유 경로 열기
              </Link>
              <Link
                href="/illegal-lending/report"
                target="_blank"
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800"
              >
                작성 페이지 열기
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-xl font-bold">2호 전세사기</h2>
            <div className="mt-4 grid gap-3">
              <Link
                href="/jeonse-damage"
                target="_blank"
                className="rounded-xl border border-cyan-300/40 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
              >
                랜딩페이지 열기
              </Link>
              <Link
                href="/free/jeonse-damage-report"
                target="_blank"
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800"
              >
                SNS 공유 경로 열기
              </Link>
              <Link
                href="/jeonse-damage/report"
                target="_blank"
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800"
              >
                작성 페이지 열기
              </Link>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-amber-300/30 bg-amber-950/30 p-5 text-sm leading-7 text-amber-100">
          <h2 className="font-bold">운영 확인 항목</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>두 팝업이 동시에 뜨지 않는지 확인합니다.</li>
            <li>GA4 DebugView에서 각 서비스 이벤트가 수신되는지 확인합니다.</li>
            <li>Meta Events Manager에서 Custom Event가 수신되는지 확인합니다.</li>
            <li>
              카카오톡·페이스북·SNS 공유 시 OG 이미지가 정상 표시되는지
              확인합니다.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
