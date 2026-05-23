import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

function formatDate(value: Date) {
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

export default async function WageClaimReportsAdminPage() {
  await requireAdmin();

  const reports = await prisma.wageClaimReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      status: true,
      reporterName: true,
      reporterPhone: true,
      companyName: true,
      unpaidTotalAmount: true,
      damageTypes: true,
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">임금체불 진정서 관리</h1>
        <p className="mt-2 text-sm text-aibeop-muted">
          임금체불 진정서·체불내역 정리센터 접수 목록입니다.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-aibeop-muted">
            <tr>
              <th className="px-4 py-3 text-left">접수시각</th>
              <th className="px-4 py-3 text-left">작성자</th>
              <th className="px-4 py-3 text-left">사업장명</th>
              <th className="px-4 py-3 text-left">총 미지급액</th>
              <th className="px-4 py-3 text-left">체불유형</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-left">상세</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-aibeop-subtle" colSpan={7}>
                  접수된 임금체불 제보가 없습니다.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{formatDate(report.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{report.reporterName}</div>
                    <div className="text-xs text-aibeop-subtle">{report.reporterPhone}</div>
                  </td>
                  <td className="px-4 py-3">{report.companyName}</td>
                  <td className="px-4 py-3">{formatAmount(report.unpaidTotalAmount)}</td>
                  <td className="px-4 py-3 text-xs text-aibeop-muted">
                    {report.damageTypes.slice(0, 2).join(", ")}
                    {report.damageTypes.length > 2
                      ? ` 외 ${report.damageTypes.length - 2}건`
                      : ""}
                  </td>
                  <td className="px-4 py-3">{report.status}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/wage-claim-reports/${report.id}`}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    >
                      보기
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
