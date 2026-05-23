import Link from "next/link";
import type { CmbAdminListItem } from "@/cmb/admin/cmb-admin-preview";
import { cmbStatusBadgeClass } from "@/cmb/admin/cmb-admin-preview";

type Props = {
  items: CmbAdminListItem[];
};

export function CmbConfigList({ items }: Readonly<Props>) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-aibeop-line bg-aibeop-card p-8 text-center text-sm text-aibeop-muted">
        등록된 CMB config가 없습니다.
      </div>
    );
  }

  return (
    <ul
      className="divide-y divide-aibeop-line rounded-2xl border border-aibeop-line bg-aibeop-card shadow-soft"
      data-testid="cmb-config-list"
    >
      {items.map((row) => (
        <li key={row.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${cmbStatusBadgeClass(row.status)}`}
              >
                {row.status}
              </span>
              <span className="font-mono text-xs text-aibeop-muted">{row.caseType}</span>
              {!row.validationOk ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                  validator FAIL
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  validator PASS
                </span>
              )}
            </div>
            <p className="mt-2 font-medium text-aibeop-text">
              {row.title} · v{row.version}
            </p>
            <p className="mt-1 font-mono text-xs text-aibeop-muted">{row.id}</p>
          </div>
          <Link
            href={row.previewHref}
            data-testid={`cmb-preview-link-${row.caseType}`}
            className="shrink-0 rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft"
          >
            Preview
          </Link>
        </li>
      ))}
    </ul>
  );
}
