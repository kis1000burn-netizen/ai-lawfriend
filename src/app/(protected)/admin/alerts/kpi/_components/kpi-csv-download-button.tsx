"use client";

import type { KpiGranularity, KpiPresetKey } from "@/lib/alerts/kpi-date-range";

export function KpiCsvDownloadButton({
  preset,
  granularity,
}: {
  preset: KpiPresetKey;
  granularity: KpiGranularity;
}) {
  function handleDownload() {
    const url = `/api/admin/alerts/kpi/export?preset=${preset}&granularity=${granularity}`;
    window.location.href = url;
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-aibeop-subtle hover:bg-slate-50"
    >
      CSV 다운로드
    </button>
  );
}
