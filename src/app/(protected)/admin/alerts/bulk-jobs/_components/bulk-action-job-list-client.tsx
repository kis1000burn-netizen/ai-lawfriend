"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { BulkRetrySchedulePresetBar } from "@/components/admin/alerts/bulk-jobs/BulkRetrySchedulePresetBar";
import { BulkActionJobTable } from "./bulk-action-job-table";

type BulkActionJobListClientProps = {
  initialRows: unknown[];
  page: number;
  totalPages: number;
};

export function BulkActionJobListClient({
  initialRows,
  page,
  totalPages,
}: Readonly<BulkActionJobListClientProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleSelect(jobId: string) {
    setSelectedIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    );
  }

  async function handleRetry(jobId: string) {
    const ok = globalThis.confirm("이 Job을 재시도하시겠습니까? (새 Job이 생성됩니다.)");
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/alerts/bulk-jobs/${jobId}/retry`, {
        method: "POST",
      });
      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "재시도 생성에 실패했습니다.");

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "재시도 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(jobId: string) {
    const reason = globalThis.prompt("취소 사유를 입력하세요. (선택)") ?? "";

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/alerts/bulk-jobs/${jobId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
        }),
      });
      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "Job 취소에 실패했습니다.");

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "취소 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function movePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/admin/alerts/bulk-jobs?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-aibeop-subtle">
          처리 중입니다...
        </div>
      )}

      <BulkRetrySchedulePresetBar
        selectedJobIds={selectedIds}
        onDone={() => {
          setSelectedIds([]);
          router.refresh();
        }}
      />

      <BulkActionJobTable
        rows={initialRows as Parameters<typeof BulkActionJobTable>[0]["rows"]}
        onRetry={handleRetry}
        onCancel={handleCancel}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div className="text-sm text-aibeop-subtle">
          페이지 {page} / {totalPages}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => movePage(page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-aibeop-subtle disabled:opacity-50"
          >
            이전
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => movePage(page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-aibeop-subtle disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
