import type { CmbAdminGlobalVerifySummary } from "@/cmb/admin/cmb-admin-preview";

type Props = {
  summary: CmbAdminGlobalVerifySummary;
};

export function CmbVerifySummaryPanel({ summary }: Readonly<Props>) {
  return (
    <section
      data-testid="cmb-verify-summary"
      className={`rounded-2xl border p-5 shadow-soft ${
        summary.ok
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-red-200 bg-red-50/80"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-aibeop-text">verify:aibeopchin-cmb (런타임 검증)</h2>
          <p className="mt-1 text-xs text-aibeop-muted">
            Admin Preview는 <code className="font-mono">{summary.command}</code>와 동일한{" "}
            <code className="font-mono">validateAllCmbConfigs()</code> 결과를 표시합니다. ({summary.configCount}{" "}
            configs)
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            summary.ok ? "bg-emerald-700 text-white" : "bg-red-700 text-white"
          }`}
        >
          {summary.ok ? "PASS" : "FAIL"}
        </span>
      </div>

      {!summary.ok && summary.errors.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-red-800" role="alert">
          {summary.errors.map((err) => (
            <li key={err} className="font-mono text-xs">
              {err}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-emerald-900">
          모든 CMB config가 registry·gate·role block 정책을 통과했습니다.
        </p>
      )}
    </section>
  );
}
