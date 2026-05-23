export function BulkJobOpsDashboard({
  data,
}: {
  data: {
    summary: {
      total: number;
      queued: number;
      running: number;
      success: number;
      partialSuccess: number;
      failed: number;
      canceled: number;
      retryCount: number;
      staleLockCount: number;
      retryRate: number;
      failureRate: number;
    };
    timeline: { date: string; total: number; failed: number; success: number }[];
  };
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Card label="총 Job" value={data.summary.total} />
        <Card label="대기열" value={data.summary.queued} />
        <Card label="실행중" value={data.summary.running} />
        <Card label="성공" value={data.summary.success} />
        <Card label="부분성공" value={data.summary.partialSuccess} />
        <Card label="실패" value={data.summary.failed} />
        <Card label="취소" value={data.summary.canceled} />
        <Card label="재시도 수" value={data.summary.retryCount} />
        <Card label="재시도율" value={`${data.summary.retryRate}%`} />
        <Card label="실패율" value={`${data.summary.failureRate}%`} />
        <Card label="stale lock 후보" value={data.summary.staleLockCount} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-aibeop-subtle">최근 운영 추이</h2>
          <p className="mt-1 text-xs text-aibeop-subtle">
            최근 집계 기준 총량 / 성공 / 실패 흐름입니다.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-aibeop-muted">일자</th>
                <th className="px-4 py-3 text-right text-aibeop-muted">총량</th>
                <th className="px-4 py-3 text-right text-aibeop-muted">성공</th>
                <th className="px-4 py-3 text-right text-aibeop-muted">실패</th>
              </tr>
            </thead>
            <tbody>
              {data.timeline.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-aibeop-subtle">
                    표시할 데이터가 없습니다.
                  </td>
                </tr>
              )}
              {data.timeline.map((row) => (
                <tr key={row.date} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-aibeop-subtle">{row.date}</td>
                  <td className="px-4 py-3 text-right text-aibeop-subtle">{row.total}</td>
                  <td className="px-4 py-3 text-right text-aibeop-subtle">{row.success}</td>
                  <td className="px-4 py-3 text-right text-aibeop-subtle">{row.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-aibeop-subtle">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-aibeop-text">{value}</div>
    </div>
  );
}
