import { Suspense } from "react";
import Link from "next/link";
import { AlertKpiWidget } from "@/components/admin/alerts/alert-kpi-widget";
import { AlertPerformanceDashboard } from "@/components/admin/alerts/alert-performance-dashboard";
import { AlertTaskBoard } from "@/components/admin/alerts/alert-task-board";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAlertBoardPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const assigneeUserId =
    typeof resolved.assigneeUserId === "string" ? resolved.assigneeUserId : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-aibeop-text">Alert Task 보드</h1>
        <p className="mt-1 text-sm text-aibeop-subtle">
          SLA, 담당자 성과, 에스컬레이션, 상태별 칸반 보드를 한 화면에서 관리합니다.
        </p>
      </div>

      {assigneeUserId ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
          담당자 필터 적용:{" "}
          <span className="font-mono font-semibold">{assigneeUserId}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/admin/alerts/kpi"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-aibeop-subtle shadow-sm hover:bg-slate-50"
        >
          경고 KPI (차트)
        </Link>
        <Link
          href="/admin/alerts/escalations"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-aibeop-subtle shadow-sm hover:bg-slate-50"
        >
          에스컬레이션 이력
        </Link>
        <Link
          href="/admin/cron"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-aibeop-subtle shadow-sm hover:bg-slate-50"
        >
          Cron 로그
        </Link>
      </div>

      <AlertKpiWidget />
      <AlertPerformanceDashboard />
      <Suspense fallback={<div className="text-sm text-aibeop-subtle">보드 로딩...</div>}>
        <AlertTaskBoard />
      </Suspense>
    </div>
  );
}
