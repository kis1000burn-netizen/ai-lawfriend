"use client";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

export type KpiSeriesRow = {
  label: string;
  created: number;
  resolved: number;
  escalated: number;
  highSeverity: number;
};

const COLORS = {
  created: "#0f172a",
  resolved: "#059669",
  escalated: "#7c3aed",
  highSeverity: "#e11d48",
};

export function AlertKpiTrendChart({
  rows,
  mode = "line",
}: {
  rows: KpiSeriesRow[];
  mode?: "line" | "bar";
}) {
  const Chart = mode === "bar" ? BarChart : LineChart;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-aibeop-subtle">경고 KPI 추이</h3>
        <p className="mt-1 text-xs text-aibeop-subtle">
          기간별 생성, 해결, 에스컬레이션, 고위험 건수 추이입니다.
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Legend />
            {mode === "bar" ? (
              <>
                <Bar dataKey="created" name="생성" fill={COLORS.created} radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" name="해결" fill={COLORS.resolved} radius={[6, 6, 0, 0]} />
                <Bar
                  dataKey="escalated"
                  name="에스컬레이션"
                  fill={COLORS.escalated}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="highSeverity"
                  name="고위험"
                  fill={COLORS.highSeverity}
                  radius={[6, 6, 0, 0]}
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="created"
                  name="생성"
                  stroke={COLORS.created}
                  strokeWidth={2}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="해결"
                  stroke={COLORS.resolved}
                  strokeWidth={2}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="escalated"
                  name="에스컬레이션"
                  stroke={COLORS.escalated}
                  strokeWidth={2}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="highSeverity"
                  name="고위험"
                  stroke={COLORS.highSeverity}
                  strokeWidth={2}
                  dot
                />
              </>
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
