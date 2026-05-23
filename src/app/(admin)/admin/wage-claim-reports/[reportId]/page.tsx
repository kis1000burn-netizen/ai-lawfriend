import { notFound } from "next/navigation";
import {
  WAGE_DAMAGE_TYPE_LABEL,
  WAGE_EMPLOYMENT_TYPE_LABEL,
  WAGE_REPORTER_TYPE_LABEL,
} from "@/features/wage-claim/wage-claim.schema";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

function formatDate(value: Date | null) {
  if (!value) return "미기재";
  return value.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(value: number | null) {
  if (value === null) return "미기재";
  return `${value.toLocaleString("ko-KR")}원`;
}

function empty(value: string | null) {
  return value && value.trim() ? value : "미기재";
}

export default async function WageClaimReportAdminDetailPage({
  params,
}: Readonly<{
  params: Promise<{ reportId: string }>;
}>) {
  await requireAdmin();

  const { reportId } = await params;

  const report = await prisma.wageClaimReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">임금체불 진정서 상세</h1>
        <p className="mt-2 text-sm text-aibeop-muted">
          접수일시 {formatDate(report.createdAt)} | 상태 {report.status}
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">기본 정보</h2>
          <ul className="space-y-2 text-sm leading-6">
            <li>작성자 유형: {WAGE_REPORTER_TYPE_LABEL[report.reporterType]}</li>
            <li>작성자 성명: {report.reporterName}</li>
            <li>작성자 연락처: {report.reporterPhone}</li>
            <li>작성자 이메일: {empty(report.reporterEmail)}</li>
            <li>근로자 성명: {empty(report.workerName)}</li>
            <li>근로자 연락처: {empty(report.workerPhone)}</li>
            <li>사업장명: {report.companyName}</li>
            <li>사업주: {empty(report.employerName)}</li>
            <li>사업장 주소: {empty(report.companyAddress)}</li>
            <li>근무지 주소: {empty(report.workplaceAddress)}</li>
            <li>사업장 연락처: {empty(report.companyPhone)}</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">근무·체불 정보</h2>
          <ul className="space-y-2 text-sm leading-6">
            <li>고용 형태: {WAGE_EMPLOYMENT_TYPE_LABEL[report.employmentType]}</li>
            <li>업무 내용: {empty(report.jobDescription)}</li>
            <li>입사일: {formatDate(report.hireDate)}</li>
            <li>퇴사 여부: {report.isResigned ? "퇴사" : "재직 또는 미기재"}</li>
            <li>퇴사일: {formatDate(report.resignationDate)}</li>
            <li>월급: {formatAmount(report.monthlyWageAmount)}</li>
            <li>일급: {formatAmount(report.dailyWageAmount)}</li>
            <li>시급: {formatAmount(report.hourlyWageAmount)}</li>
            <li>미지급 임금: {formatAmount(report.unpaidWageAmount)}</li>
            <li>미지급 퇴직금: {formatAmount(report.unpaidSeveranceAmount)}</li>
            <li>미지급 수당: {formatAmount(report.unpaidAllowanceAmount)}</li>
            <li>총 미지급액: {formatAmount(report.unpaidTotalAmount)}</li>
            <li>체불 기간: {empty(report.unpaidPeriod)}</li>
            <li>지급 예정일: {formatDate(report.paymentDueDate)}</li>
            <li>
              체불 유형: {" "}
              {report.damageTypes
                .map((type) => WAGE_DAMAGE_TYPE_LABEL[type])
                .join(", ")}
            </li>
          </ul>
        </article>
      </section>

      <section className="mt-6 grid gap-6">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">피해 요약</h2>
          <p className="whitespace-pre-wrap text-sm leading-7">{report.damageSummary}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">지급 요구 이력</h2>
          <p className="whitespace-pre-wrap text-sm leading-7">{empty(report.requestHistory)}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">증거자료 목록</h2>
          <p className="whitespace-pre-wrap text-sm leading-7">{empty(report.evidenceSummary)}</p>
        </article>
      </section>

      <section className="mt-6 grid gap-6">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">생성된 진정서 초안</h2>
          <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {report.generatedStatement}
          </pre>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">생성된 체불내역 정리표</h2>
          <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {report.generatedTable}
          </pre>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">생성된 제출 체크리스트</h2>
          <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {report.generatedChecklist}
          </pre>
        </article>
      </section>
    </main>
  );
}
