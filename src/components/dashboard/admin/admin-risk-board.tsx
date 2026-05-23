import type { AdminAttentionPreviewItem } from "@/lib/dashboard/dashboard-metrics";
import { DashboardPreviewCard } from "@/components/dashboard/dashboard-preview-card";

type Props = {
  attentionNeeded?: number;
  staleCaseCount?: number;
  items?: AdminAttentionPreviewItem[];
  showPreviewEmpty?: boolean;
};

export function AdminRiskBoard({
  attentionNeeded = 0,
  staleCaseCount = 0,
  items = [],
  showPreviewEmpty = true,
}: Props) {
  return (
    <div className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft ring-1 ring-aibeop-line/70 sm:rounded-3xl sm:p-6">
      <h3 className="text-lg font-black text-aibeop-text sm:text-xl">운영 확인 후보</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-aibeop-text">
        보류, 접수 대기, 검토 대기 상태의 사건을 운영 확인 후보로 정리합니다.
      </p>
      <p className="mt-2 text-xs font-semibold leading-relaxed text-aibeop-deep">
        장기 미진행 후보는 별도 배지와 보조 지표로만 표시됩니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-aibeop-line bg-aibeop-soft p-3">
          <p className="text-xs font-bold text-aibeop-deep">운영 확인 필요</p>
          <p className="mt-1 text-lg font-black tabular-nums text-aibeop-text">
            {attentionNeeded.toLocaleString()}건
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-snug text-aibeop-text">
            보류·접수 보완 대기 건수(기존 지표)
          </p>
        </div>
        <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-3">
          <p className="text-xs font-bold text-amber-950">장기 미진행 후보</p>
          <p className="mt-1 text-lg font-black tabular-nums text-amber-950">
            {staleCaseCount.toLocaleString()}건
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-snug text-amber-900">
            보조 확인 지표 · attentionNeeded에 합산되지 않음
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs font-semibold leading-relaxed text-aibeop-text">
        {staleCaseCount > 0
          ? `장기 미진행 후보 ${staleCaseCount.toLocaleString()}건은 운영 확인 보조 지표로만 표시됩니다.`
          : "장기 미진행 후보도 현재 확인되지 않았습니다."}
      </p>

      {items.length > 0 ? (
        <ul className="mt-5 grid gap-4">
          {items.map((item) => (
            <DashboardPreviewCard
              key={item.id}
              title={item.title}
              href={item.href}
              ctaLabel={item.label}
              status={item.status}
              statusLabel={item.statusLabel}
              updatedAtLabel={item.updatedAtLabel}
              reason={item.staleReason ?? item.reason}
              tone="amber"
              badgeLabel={item.staleLabel}
              badgeTone={item.staleLabel ? "amber" : undefined}
            />
          ))}
        </ul>
      ) : showPreviewEmpty ? (
        <div className="mt-5 rounded-2xl border border-aibeop-line bg-aibeop-soft p-4">
          <p className="text-sm font-bold text-aibeop-text">
            현재 운영 확인 후보는 없습니다.
          </p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-aibeop-deep">
            보류, 접수 대기, 검토 대기 상태의 사건이 확인되면 이 영역에 표시됩니다.
          </p>
        </div>
      ) : null}
    </div>
  );
}
