"use client";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

type SeriesRow = {
  label: string;
  created: number;
  resolved: number;
};

export function AlertResolutionRateChart({ rows }: { rows: SeriesRow[] }) {
  const data = rows.map((row) => ({
    ...row,
    resolutionRate:
      row.created > 0 ? Number(((row.resolved / row.created) * 100).toFixed(1)) : 0,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-aibeop-subtle">기간별 해결률</h3>
        <p className="mt-1 text-xs text-aibeop-subtle">각 구간의 생성 대비 해결 비율입니다.</p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} domain={[0, 100]} unit="%" />
            <Tooltip formatter={(value) => [`${value}%`, "해결률"]} />
            <Area
              type="monotone"
              dataKey="resolutionRate"
              name="해결률"
              stroke="#0f172a"
              fill="#94a3b8"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
