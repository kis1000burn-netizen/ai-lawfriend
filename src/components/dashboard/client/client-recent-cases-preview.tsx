import Link from "next/link";

import { DashboardPreviewCard } from "@/components/dashboard/dashboard-preview-card";
import { DashboardPreviewEmpty } from "@/components/dashboard/dashboard-preview-empty";
import { getClientReadinessTone } from "@/lib/dashboard/client-readiness-badge";
import type { ClientCasePreviewItem } from "@/lib/dashboard/dashboard-metrics";

type Props = {
  items?: ClientCasePreviewItem[];
};

export function ClientRecentCasesPreview({ items = [] }: Props) {
  return (
    <section className="rounded-3xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft ring-1 ring-aibeop-line/70">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-aibeop-deep">Recent Cases</p>
          <h3 className="mt-1 text-xl font-black text-aibeop-text">최근 사건</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-aibeop-text">
            최근 정리한 사건과 진행 상태를 확인합니다.
          </p>
        </div>

        <Link
          href="/cases"
          className="text-sm font-bold text-aibeop-deep underline hover:text-aibeop-green"
        >
          전체 사건 보기 →
        </Link>
      </div>

      {items.length > 0 ? (
        <ul className="mt-5 grid gap-3">
          {items.map((item) => (
            <DashboardPreviewCard
              key={item.id}
              title={item.title}
              href={item.href}
              ctaLabel={item.label}
              status={item.status}
              statusLabel={item.statusLabel}
              updatedAtLabel={item.updatedAtLabel}
              tone="cyan"
              badgeLabel={item.readinessLabel}
              badgeTone={getClientReadinessTone(item.readinessPercent)}
            />
          ))}
        </ul>
      ) : (
        <DashboardPreviewEmpty message="아직 표시할 최근 사건이 없습니다. 새 사건을 만들면 이곳에 최근 사건으로 표시됩니다." />
      )}
    </section>
  );
}
