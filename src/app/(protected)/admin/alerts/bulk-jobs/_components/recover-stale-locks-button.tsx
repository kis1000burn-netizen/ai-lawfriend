"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

export function RecoverStaleLocksButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRecover() {
    const ok = window.confirm("stale lock 후보 Job을 자동 복구하시겠습니까?");
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch("/api/admin/alerts/bulk-jobs/recover-stale-locks", {
        method: "POST",
      });
      const raw = await res.json().catch(() => null);
      const body = requireOkResponseBody(res, raw, "복구 실행에 실패했습니다.");
      const scannedCount =
        typeof body.scannedCount === "number" ? body.scannedCount : 0;

      alert(`복구 스캔 완료: ${scannedCount}건 검사`);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "복구 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRecover}
      disabled={loading}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-aibeop-subtle hover:bg-slate-50 disabled:opacity-50"
    >
      {loading ? "복구 중..." : "stale lock 복구 실행"}
    </button>
  );
}
