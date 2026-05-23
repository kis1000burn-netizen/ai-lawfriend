"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { KpiRangePresetBar } from "@/components/admin/alerts/kpi-range-preset-bar";
import { AlertKpiTrendChart } from "./alert-kpi-trend-chart";
import { AlertResolutionRateChart } from "./alert-resolution-rate-chart";
import { KpiCsvDownloadButton } from "./kpi-csv-download-button";
import type { KpiGranularity, KpiPresetKey } from "@/lib/alerts/kpi-date-range";

type KpiResponse = {
  ok?: boolean;
  range: {
    preset: KpiPresetKey;
    granularity: KpiGranularity;
    start: string;
    end: string;
  };
  summary: {
    totalCreated: number;
    totalResolved: number;
    totalEscalated: number;
    avgResolutionHours: number;
    resolutionRate: number;
  };
  series: {
    label: string;
    created: number;
    resolved: number;
    escalated: number;
    highSeverity: number;
  }[];
};

export function AlertKpiApiDashboard() {
  const [preset, setPreset] = useState<KpiPresetKey>("30d");
  const [granularity, setGranularity] = useState<KpiGranularity>("week");
  const [chartMode, setChartMode] = useState<"line" | "bar">("line");
  const [data, setData] = useState<KpiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/alerts/kpi?preset=${preset}&granularity=${granularity}`,
          { cache: "no-store" }
        );
        const raw = await res.json().catch(() => null);
        let body: Record<string, unknown>;
        try {
          body = requireOkResponseBody(
            res,
            raw,
            "기간 KPI를 불러오지 못했습니다.",
          );
        } catch {
          if (!ignore) {
            setData(null);
          }
          return;
        }
        if (ignore) {
          return;
        }
        const { range, summary, series } = body;
        if (
          range &&
          typeof range === "object" &&
          summary &&
          typeof summary === "object" &&
          Array.isArray(series)
        ) {
          setData({
            range: range as KpiResponse["range"],
            summary: summary as KpiResponse["summary"],
            series: series as KpiResponse["series"],
          });
        } else {
          setData(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [preset, granularity]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-aibeop-text">기간 프리셋 집계</h2>
      <p className="text-sm text-aibeop-subtle">
        7일·14일·30일·분기 범위와 일·주·월 단위 버킷으로 생성·해결·에스컬레이션·고위험 건수를 봅니다.
      </p>

      <KpiRangePresetBar
        preset={preset}
        granularity={granularity}
        onChangePreset={(next) => {
          setPreset(next);
          if (next === "7d" || next === "14d") setGranularity("day");
          if (next === "30d") setGranularity("week");
          if (next === "quarter") setGranularity("month");
        }}
        onChangeGranularity={setGranularity}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setChartMode("line")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              chartMode === "line" ? "bg-slate-900 text-white" : "text-aibeop-muted"
            }`}
          >
            선형
          </button>
          <button
            type="button"
            onClick={() => setChartMode("bar")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              chartMode === "bar" ? "bg-slate-900 text-white" : "text-aibeop-muted"
            }`}
          >
            막대
          </button>
        </div>

        <KpiCsvDownloadButton preset={preset} granularity={granularity} />
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-aibeop-subtle">
          KPI를 불러오는 중입니다...
        </div>
      )}

      {!loading && data && (
        <>
          <div className="text-xs text-aibeop-subtle">
            범위: {new Date(data.range.start).toLocaleDateString("ko-KR")} ~{" "}
            {new Date(data.range.end).toLocaleDateString("ko-KR")} · 집계:{" "}
            {data.range.granularity}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <KpiCard label="생성" value={data.summary.totalCreated} />
            <KpiCard label="해결" value={data.summary.totalResolved} />
            <KpiCard label="에스컬레이션" value={data.summary.totalEscalated} />
            <KpiCard label="해결률" value={`${data.summary.resolutionRate}%`} />
            <KpiCard label="평균 해결시간" value={`${data.summary.avgResolutionHours}h`} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AlertKpiTrendChart rows={data.series} mode={chartMode} />
            <AlertResolutionRateChart rows={data.series} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-semibold text-aibeop-subtle">기간별 집계 표</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 text-aibeop-subtle">
                  <tr>
                    <th className="px-3 py-2 text-left">구간</th>
                    <th className="px-3 py-2 text-right">생성</th>
                    <th className="px-3 py-2 text-right">해결</th>
                    <th className="px-3 py-2 text-right">에스컬레이션</th>
                    <th className="px-3 py-2 text-right">고위험</th>
                    <th className="px-3 py-2 text-right">해결률</th>
                  </tr>
                </thead>
                <tbody>
                  {data.series.map((row) => {
                    const resolutionRate =
                      row.created > 0
                        ? Number(((row.resolved / row.created) * 100).toFixed(1))
                        : 0;

                    return (
                      <tr key={row.label} className="border-b border-slate-100">
                        <td className="px-3 py-2 text-aibeop-subtle">{row.label}</td>
                        <td className="px-3 py-2 text-right text-aibeop-subtle">{row.created}</td>
                        <td className="px-3 py-2 text-right text-aibeop-subtle">{row.resolved}</td>
                        <td className="px-3 py-2 text-right text-aibeop-subtle">{row.escalated}</td>
                        <td className="px-3 py-2 text-right text-aibeop-subtle">{row.highSeverity}</td>
                        <td className="px-3 py-2 text-right text-aibeop-subtle">{resolutionRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && !data && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          기간 KPI를 불러오지 못했습니다.
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-aibeop-subtle">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-aibeop-text">{value}</div>
    </div>
  );
}
