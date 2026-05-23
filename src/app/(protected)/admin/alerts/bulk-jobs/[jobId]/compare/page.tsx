import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { BulkJobComparePanel } from "@/components/admin/alerts/bulk-jobs/bulk-job-compare-panel";

type PageProps = {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ retryJobId?: string; diffFilter?: string }>;
};

export default async function BulkJobComparePage({ params, searchParams }: PageProps) {
  await requireAdmin();

  const { jobId } = await params;
  const { retryJobId } = await searchParams;

  if (!retryJobId) {
    notFound();
  }

  const [sourceJob, retryJob] = await Promise.all([
    prisma.bulkActionJob.findUnique({
      where: { id: jobId },
      select: { id: true, action: true, status: true },
    }),
    prisma.bulkActionJob.findUnique({
      where: { id: retryJobId },
      select: { id: true, action: true, status: true, retryOfJobId: true },
    }),
  ]);

  if (!sourceJob || !retryJob) {
    notFound();
  }

  if (retryJob.retryOfJobId !== sourceJob.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-aibeop-subtle">관리자 / 경고 / Bulk Jobs</div>
        <h1 className="mt-1 text-2xl font-semibold text-aibeop-text">BulkActionJob 비교</h1>
        <p className="mt-2 text-sm text-aibeop-muted">
          원본 Job <span className="font-mono text-aibeop-text">{sourceJob.id}</span> 과 재시도 Job{" "}
          <span className="font-mono text-aibeop-text">{retryJob.id}</span> 의 처리 결과를 비교합니다.
        </p>
      </div>

      <Suspense fallback={<div className="text-sm text-aibeop-subtle">비교 패널을 불러오는 중…</div>}>
        <BulkJobComparePanel jobId={jobId} retryJobId={retryJobId} />
      </Suspense>
    </div>
  );
}
