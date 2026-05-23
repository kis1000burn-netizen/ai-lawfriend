"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

export function CronRetryButton({
  runId,
  disabled = false,
}: {
  runId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRetry() {
    const ok = window.confirm("이 실패 실행을 재시도하시겠습니까?");
    if (!ok) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/cron/logs/${runId}/retry`, {
        method: "POST",
      });

      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "재시도에 실패했습니다.");

      alert("재시도가 완료되었습니다.");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "재시도 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={() => void handleRetry()}
      className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-aibeop-subtle hover:bg-slate-50 disabled:opacity-50"
    >
      {loading ? "재시도 중..." : "실패 재시도"}
    </button>
  );
}
