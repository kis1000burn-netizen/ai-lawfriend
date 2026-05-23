import Link from "next/link";
import { AlertKpiDashboard } from "@/components/admin/alerts/alert-kpi-dashboard";
import { AlertKpiApiDashboard } from "./_components/alert-kpi-api-dashboard";
import { KpiExportButton } from "@/components/admin/alerts/kpi-export-button";
import { requireAdmin } from "@/lib/auth/session";
import { getAlertKpiAdvanced } from "@/lib/alerts/kpi-advanced";

type PageProps = {
  searchParams: Promise<{
    days?: string;
  }>;
};

export default async function AdminAlertKpiPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const days = Number(sp.days || "14");
  const data = await getAlertKpiAdvanced(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-aibeop-text">경고 KPI</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">
            기간별 추이와 담당자별 성과를 확인합니다. (감지일 기준)
          </p>
        </div>
        <KpiExportButton days={days} />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {[7, 14, 30].map((d) => (
          <Link
            key={d}
            href={`/admin/alerts/kpi?days=${d}`}
            className={`rounded-xl border px-3 py-2 font-medium ${
              days === d
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-aibeop-subtle hover:bg-slate-50"
            }`}
          >
            {d}일
          </Link>
        ))}
        <Link
          href="/admin/alerts/board"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-aibeop-subtle hover:bg-slate-50"
        >
          보드로
        </Link>
      </div>

      <AlertKpiApiDashboard />

      <AlertKpiDashboard
        summary={data.summary}
        timeline={data.timeline}
        assigneeStats={data.assigneeStats}
      />
    </div>
  );
}
