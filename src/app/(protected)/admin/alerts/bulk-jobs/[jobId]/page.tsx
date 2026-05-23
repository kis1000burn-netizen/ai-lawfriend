import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import FailedJobItemsTable from "@/components/admin/alerts/bulk-jobs/failed-job-items-table";
import { BulkJobFailedItemsExportButton } from "@/components/admin/alerts/bulk-jobs/bulk-job-failed-items-export-button";
import { FailedTaxonomyRecommendationPanel } from "@/components/admin/alerts/bulk-jobs/failed-taxonomy-recommendation-panel";
import { getFailedTaxonomySummaryForJob } from "@/lib/bulk-jobs/failed-taxonomy-summary";
import { BulkActionJobDetailCard } from "./_components/bulk-action-job-detail-card";
import { BulkActionJobNotificationsPanel } from "./_components/bulk-action-job-notifications-panel";
import { BulkActionJobRetryHistory } from "./_components/bulk-action-job-retry-history";
import { BulkJobActivityTimeline } from "@/components/admin/alerts/bulk-jobs/BulkJobActivityTimeline";
import { BulkJobTimelineFilterBar } from "@/components/admin/alerts/bulk-jobs/BulkJobTimelineFilterBar";
import {
  getBulkJobActivityTimeline,
  parseTimelineKindQuery,
} from "@/lib/bulk-jobs/activity-timeline";

type PageProps = {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ timelineKind?: string }>;
};

export default async function BulkActionJobDetailPage({ params, searchParams }: PageProps) {
  await requireAdmin();

  const { jobId } = await params;
  const sp = await searchParams;
  const timelineKind = parseTimelineKindQuery(sp.timelineKind);

  const job = await prisma.bulkActionJob.findUnique({
    where: { id: jobId },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      canceledBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!job) return notFound();

  const [relatedNotifications, retries, failedTaxonomy, activityTimelineResult] = await Promise.all([
    prisma.adminNotification.findMany({
      where: {
        metaJson: {
          path: ["bulkActionJobId"],
          equals: job.id,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.bulkActionJob.findMany({
      where: {
        OR: [
          { retryOfJobId: job.id },
          ...(job.retryOfJobId ? [{ id: job.retryOfJobId }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    }),
    getFailedTaxonomySummaryForJob(jobId),
    getBulkJobActivityTimeline(jobId, timelineKind),
  ]);

  const activityTimeline = activityTimelineResult.events;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-aibeop-subtle">관리자 / 경고 / Bulk Jobs</div>
        <h1 className="mt-1 text-2xl font-semibold text-aibeop-text">BulkActionJob 상세</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BulkJobFailedItemsExportButton jobId={job.id} />
        <Link
          href={`/admin/alerts/bulk-jobs/${job.id}/settings`}
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
        >
          우선순위·동시성 설정
        </Link>
        {job.retryOfJobId ? (
          <Link
            href={`/admin/alerts/bulk-jobs/${job.retryOfJobId}/compare?retryJobId=${job.id}`}
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            원본/재시도 비교
          </Link>
        ) : null}
        <Link
          href="/admin/alerts/bulk-jobs/schedules"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
        >
          예약 재시도
        </Link>
        <Link
          href="/admin/alerts/ops-queue"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
        >
          운영 큐
        </Link>
        <Link
          href="/admin/alerts/ops-queue/dashboard"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
        >
          운영 워크로드
        </Link>
      </div>

      <BulkActionJobDetailCard job={job as unknown as Record<string, unknown>} />

      <FailedTaxonomyRecommendationPanel
        jobId={jobId}
        rows={failedTaxonomy.rows}
        totalFailed={failedTaxonomy.totalFailed}
      />

      <BulkActionJobRetryHistory rows={retries} />
      <Suspense fallback={<div className="text-sm text-aibeop-subtle">타임라인 필터 로딩…</div>}>
        <BulkJobTimelineFilterBar />
      </Suspense>
      <BulkJobActivityTimeline events={activityTimeline} />
      <BulkActionJobNotificationsPanel rows={relatedNotifications} />

      <Suspense fallback={<div className="text-sm text-aibeop-subtle">실패 항목을 불러오는 중…</div>}>
        <FailedJobItemsTable jobId={jobId} />
      </Suspense>
    </div>
  );
}
