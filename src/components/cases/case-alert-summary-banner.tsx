"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type Summary = {
  total: number;
  openCount: number;
  acknowledgedCount: number;
  ignoredCount: number;
  resolvedCount: number;
  criticalOpenCount: number;
};

type Props = {
  caseId: string;
};

export function CaseAlertSummaryBanner({ caseId }: Props) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/alert-events/by-case/${caseId}/summary`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "사건 경고 요약 조회 실패");
      setSummary((data.summary as Summary | undefined) ?? null);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-aibeop-subtle shadow-sm">
        사건 경고 요약을 불러오는 중...
      </div>
    );
  }

  if (!summary) return null;

  const hasOpen = summary.openCount > 0;
  const hasCritical = summary.criticalOpenCount > 0;

  const tone = hasCritical
    ? "border-rose-200 bg-rose-50 text-rose-800"
    : hasOpen
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <section className={`rounded-2xl border p-4 shadow-sm ${tone}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-semibold">사건 경고 요약</div>
          <div className="mt-1 text-sm">
            전체 {summary.total}건 / 미확인 {summary.openCount}건 / 치명 미확인{" "}
            {summary.criticalOpenCount}건
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/70 px-3 py-1.5 font-medium">
            확인 {summary.acknowledgedCount}
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1.5 font-medium">
            무시 {summary.ignoredCount}
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1.5 font-medium">
            해결 {summary.resolvedCount}
          </span>
          <Link
            href={`/admin/audit-logs?entityType=CASE&entityId=${encodeURIComponent(caseId)}`}
            className="rounded-full bg-slate-900 px-3 py-1.5 font-semibold text-white"
          >
            사건 감사로그 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
