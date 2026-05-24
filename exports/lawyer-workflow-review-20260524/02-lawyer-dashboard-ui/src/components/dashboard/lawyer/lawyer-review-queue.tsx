import Link from "next/link";

import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { DashboardPreviewCard } from "@/components/dashboard/dashboard-preview-card";
import { DashboardPreviewEmpty } from "@/components/dashboard/dashboard-preview-empty";
import {
  EMPTY_LAWYER_DASHBOARD_METRICS,
  type LawyerDashboardMetrics,
} from "@/lib/dashboard/dashboard-metrics";

type Props = {
  metrics?: LawyerDashboardMetrics;
  showPreviewEmpty?: boolean;
};

export function LawyerReviewQueue({
  metrics = EMPTY_LAWYER_DASHBOARD_METRICS,
  showPreviewEmpty = true,
}: Props) {
  const items = [
    {
      title: "인터뷰 완료 사건",
      count: metrics.interviewCompleted,
      description: "검토 가능한 사건",
    },
    {
      title: "문서 초안 대기",
      count: metrics.draftReady,
      description: "초안 생성 또는 검토 필요",
    },
    {
      title: "보완 요청 필요",
      count: metrics.needsSupplement,
      description: "자료 또는 진술 보완 필요",
    },
  ];

  const previewItems = metrics.reviewQueuePreview ?? [];

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <DashboardMetricCard
            key={item.title}
            title={item.title}
            value={item.count}
            description={item.description}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft ring-1 ring-aibeop-line/70 sm:rounded-3xl sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-aibeop-deep">
              Review Preview
            </p>
            <h3 className="mt-1 text-lg font-black text-aibeop-text sm:text-xl">
              최근 검토 후보 사건
            </h3>
          </div>

          <Link
            href="/cases"
            className="text-sm font-bold text-aibeop-deep underline hover:text-aibeop-green"
          >
            전체 사건 보기 →
          </Link>
        </div>

        {previewItems.length > 0 ? (
          <ul className="mt-5 grid gap-3">
            {previewItems.map((item) => (
              <DashboardPreviewCard
                key={item.id}
                title={item.title}
                href={item.href}
                ctaLabel={item.label}
                status={item.status}
                statusLabel={item.statusLabel}
                updatedAtLabel={item.updatedAtLabel}
                tone="indigo"
                badgeLabel={item.priorityLabel}
                badgeTone={item.priorityTone}
              />
            ))}
          </ul>
        ) : showPreviewEmpty ? (
          <DashboardPreviewEmpty message="현재 검토 후보로 표시할 사건이 없습니다. 인터뷰가 완료되거나 문서 검토 단계로 이동한 사건이 생기면 이곳에 표시됩니다." />
        ) : null}
      </div>
    </div>
  );
}
