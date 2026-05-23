import { DashboardLivingHeader } from "@/components/dashboard/dashboard-living-header";
import { DashboardSectionHeading } from "@/components/dashboard/dashboard-section-heading";
import { LawyerCaseRadar } from "@/components/dashboard/lawyer/lawyer-case-radar";
import { LawyerDashboardEmptyGuide } from "@/components/dashboard/lawyer/lawyer-dashboard-empty-guide";
import { LawyerDashboardPendingApproval } from "@/components/dashboard/lawyer/lawyer-dashboard-pending-approval";
import { LawyerPriorityCard } from "@/components/dashboard/lawyer/lawyer-priority-card";
import { LawyerReviewQueue } from "@/components/dashboard/lawyer/lawyer-review-queue";
import { shouldShowLawyerEmptyGuide } from "@/lib/dashboard/dashboard-empty-state";
import {
  EMPTY_LAWYER_DASHBOARD_METRICS,
  type LawyerDashboardMetrics,
} from "@/lib/dashboard/dashboard-metrics";

type Props = {
  metrics?: LawyerDashboardMetrics;
};

export function LawyerDashboardHome({
  metrics = EMPTY_LAWYER_DASHBOARD_METRICS,
}: Props) {
  const showEmptyGuide = shouldShowLawyerEmptyGuide(metrics);

  return (
    <div className="grid gap-8 md:gap-10">
      <DashboardLivingHeader
        role="lawyer"
        statusText="검토 대기 사건과 보완 필요 사건을 우선 확인하세요."
      />

      <section>
        <DashboardSectionHeading
          eyebrow="Review Queue"
          title="오늘의 검토 큐"
          description="사건의 진행 상태와 검토 우선순위를 빠르게 파악합니다."
        />
        <LawyerReviewQueue
          metrics={metrics}
          showPreviewEmpty={!showEmptyGuide}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <LawyerCaseRadar />
        <div>
          <DashboardSectionHeading
            eyebrow="Priority Actions"
            title="바로 처리할 작업"
          />
          <LawyerPriorityCard />
        </div>
      </section>

      {showEmptyGuide && <LawyerDashboardEmptyGuide />}
      <LawyerDashboardPendingApproval isPending={false} />
    </div>
  );
}
