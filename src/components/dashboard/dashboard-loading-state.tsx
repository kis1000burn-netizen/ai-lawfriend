export function DashboardLoadingState() {
  return (
    <div
      className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft ring-1 ring-aibeop-line/70 sm:rounded-3xl sm:p-6"
      role="status"
      aria-busy="true"
      aria-label="불러오는 중"
    >
      <span className="sr-only">대시보드 정보를 불러오는 중입니다.</span>
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded-full bg-aibeop-line" />
        <div className="h-8 w-2/3 max-w-md rounded-full bg-aibeop-line" />
        <div className="h-4 w-full rounded-full bg-aibeop-line" />
        <div className="h-4 w-5/6 rounded-full bg-aibeop-line" />
        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
          <div className="h-24 rounded-2xl bg-aibeop-soft" />
          <div className="h-24 rounded-2xl bg-aibeop-soft" />
          <div className="h-24 rounded-2xl bg-aibeop-soft" />
        </div>
      </div>
    </div>
  );
}
