export function BulkJobFailureReasonWidget({
  rows,
}: {
  rows: { reason: string; count: number }[];
}) {
  const maxCount = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-aibeop-subtle">실패 사유 상위 통계</h2>
        <p className="mt-1 text-xs text-aibeop-subtle">
          FAILED / PARTIAL_SUCCESS Job에서 추출한 주요 실패 사유입니다.
        </p>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-aibeop-subtle">
            집계할 실패 사유가 없습니다.
          </div>
        )}

        {rows.map((row, idx) => (
          <div key={`${row.reason}-${idx}`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-aibeop-subtle" title={row.reason}>
                {row.reason}
              </span>
              <span className="shrink-0 font-medium text-aibeop-text">{row.count}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-900"
                style={{
                  width: `${Math.min(100, (row.count / maxCount) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
