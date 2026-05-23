import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "불법사금융 신고서 관리 | AI법친 관리자",
};

export default async function AdminIllegalLendingReportsPage() {
  const reports = await prisma.illegalLendingReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      reporterName: true,
      reporterPhone: true,
      reporterType: true,
      damageTypes: true,
      status: true,
      createdAt: true,
      damageSummary: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-300">AI법친 관리자</p>
              <h1 className="text-3xl font-bold">불법사금융 피해 신고서 관리</h1>
            </div>
            <Link
              href="/admin/illegal-lending-reports/predeploy-check"
              className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
            >
              배포 전 운영 점검
            </Link>
          </div>
          <p className="mt-2 text-sm text-aibeop-faint">
            무료 신고서 작성센터에서 접수된 신고서 초안을 확인합니다.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-900 text-left text-aibeop-disabled">
              <tr>
                <th className="p-4">접수일</th>
                <th className="p-4">신고인</th>
                <th className="p-4">연락처</th>
                <th className="p-4">유형</th>
                <th className="p-4">상태</th>
                <th className="p-4">요약</th>
                <th className="p-4">상세</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-slate-800">
                  <td className="p-4 text-aibeop-faint">
                    {report.createdAt.toLocaleString("ko-KR")}
                  </td>
                  <td className="p-4 font-semibold">
                    <Link
                      href={`/admin/illegal-lending-reports/${report.id}`}
                      className="text-cyan-100 hover:text-cyan-300"
                    >
                      {report.reporterName}
                    </Link>
                  </td>
                  <td className="p-4">{report.reporterPhone}</td>
                  <td className="p-4">{report.reporterType}</td>
                  <td className="p-4">
                    <span className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs text-cyan-100">
                      {report.status}
                    </span>
                  </td>
                  <td className="max-w-md truncate p-4 text-aibeop-disabled">
                    {report.damageSummary}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/illegal-lending-reports/${report.id}`}
                      className="rounded-xl border border-cyan-300/40 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/10"
                    >
                      상세보기
                    </Link>
                  </td>
                </tr>
              ))}

              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-aibeop-faint"
                  >
                    아직 접수된 신고서가 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
