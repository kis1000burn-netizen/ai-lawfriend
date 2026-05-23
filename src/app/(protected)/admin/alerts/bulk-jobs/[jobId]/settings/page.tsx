import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { BulkJobAdminSettingsForm } from "@/components/admin/alerts/bulk-jobs/bulk-job-admin-settings-form";

type Props = {
  params: Promise<{ jobId: string }>;
};

export default async function BulkJobSettingsPage({ params }: Props) {
  await requireAdmin();

  const { jobId } = await params;

  const job = await prisma.bulkActionJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      priority: true,
      queueGroup: true,
      concurrencyKey: true,
      maxConcurrency: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!job) notFound();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-aibeop-subtle">관리자 / 경고 / Bulk Jobs</div>
        <h1 className="mt-1 text-2xl font-semibold text-aibeop-text">BulkActionJob 관리자 설정</h1>
        <p className="mt-1 text-sm text-aibeop-subtle">job 우선순위 및 동시성 제약을 운영자가 수정합니다.</p>
      </div>

      <BulkJobAdminSettingsForm
        job={{
          ...job,
          priority: job.priority,
        }}
      />
    </div>
  );
}
