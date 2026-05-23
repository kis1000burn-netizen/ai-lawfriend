import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "전세사기·보증금 반환 피해 서류 관리 | AI법친 관리자",
};

export default async function AdminJeonseDamageReportsPage() {
  await requireAdmin();

  const reports = await prisma.jeonseDamageReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      reporterName: true,
      reporterPhone: true,
      propertyAddress: true,
      depositAmount: true,
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
          <p className="text-sm font-semibold text-cyan-300">AI법친 관리자</p>
          <h1 className="text-3xl font-bold">
            전세사기·보증금 반환 피해 서류 관리
          </h1>
          <p className="mt-2 text-sm text-aibeop-faint">
            무료 서류 정리센터에서 접수된 피해사실 요약서를 확인합니다.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-900 text-left text-aibeop-disabled">
              <tr>
                <th className="p-4">접수일</th>
                <th className="p-4">작성자</th>
                <th className="p-4">연락처</th>
                <th className="p-4">주소</th>
                <th className="p-4">보증금</th>
                <th className="p-4">상태</th>
                <th className="p-4">요약</th>
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
                      href={`/admin/jeonse-damage-reports/${report.id}`}
                      className="text-cyan-100 hover:text-cyan-300"
                    >
                      {report.reporterName}
                    </Link>
                  </td>
                  <td className="p-4">{report.reporterPhone}</td>
                  <td className="max-w-xs truncate p-4">{report.propertyAddress}</td>
                  <td className="p-4">
                    {report.depositAmount
                      ? `${report.depositAmount.toLocaleString("ko-KR")}원`
                      : "미기재"}
                  </td>
                  <td className="p-4">
                    <span className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs text-cyan-100">
                      {report.status}
                    </span>
                  </td>
                  <td className="max-w-md truncate p-4 text-aibeop-disabled">
                    {report.damageSummary}
                  </td>
                </tr>
              ))}
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-aibeop-faint">
                    아직 접수된 전세사기·보증금 반환 피해 서류가 없습니다.
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
