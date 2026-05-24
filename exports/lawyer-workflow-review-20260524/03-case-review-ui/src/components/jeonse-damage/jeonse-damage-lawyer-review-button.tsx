"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCurrentJeonseDamagePromoVariant } from "@/features/jeonse-damage/promo/jeonse-damage-current-variant";
import { trackJeonseDamagePromoEvent } from "@/features/jeonse-damage/promo/jeonse-damage-promo-analytics";
import { JEONSE_DAMAGE_PROMO_EVENTS } from "@/features/jeonse-damage/promo/jeonse-damage-promo-events";

export function JeonseDamageLawyerReviewButton({
  reportId,
}: Readonly<{
  reportId: string;
}>) {
  const router = useRouter();
  const [memo, setMemo] = useState("");
  const [assignedLawyerName, setAssignedLawyerName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestReview() {
    setLoading(true);
    setMessage("");

    try {
      trackJeonseDamagePromoEvent(
        JEONSE_DAMAGE_PROMO_EVENTS.LAWYER_REVIEW_REQUEST_ATTEMPT,
        {
          source: "admin_lawyer_review",
          variant: getCurrentJeonseDamagePromoVariant(),
          reportId,
          hasAssignedLawyerName: Boolean(assignedLawyerName.trim()),
        },
      );

      const res = await fetch(
        `/api/admin/jeonse-damage-reports/${reportId}/lawyer-review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memo,
            assignedLawyerName,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok || !data.ok) {
        trackJeonseDamagePromoEvent(
          JEONSE_DAMAGE_PROMO_EVENTS.LAWYER_REVIEW_REQUEST_FAIL,
          {
            source: "admin_lawyer_review",
            variant: getCurrentJeonseDamagePromoVariant(),
            reportId,
            reason: data.message || "response_not_ok",
          },
        );
        setMessage(data.message || "변호사 검토 요청에 실패했습니다.");
        return;
      }

      trackJeonseDamagePromoEvent(
        JEONSE_DAMAGE_PROMO_EVENTS.LAWYER_REVIEW_REQUEST_SUCCESS,
        {
          source: "admin_lawyer_review",
          variant: getCurrentJeonseDamagePromoVariant(),
          reportId,
          hasAssignedLawyerName: Boolean(assignedLawyerName.trim()),
        },
      );

      setMessage("변호사 검토 요청이 생성되었습니다.");
      setMemo("");
      setAssignedLawyerName("");
      router.refresh();
    } catch {
      trackJeonseDamagePromoEvent(
        JEONSE_DAMAGE_PROMO_EVENTS.LAWYER_REVIEW_REQUEST_FAIL,
        {
          source: "admin_lawyer_review",
          variant: getCurrentJeonseDamagePromoVariant(),
          reportId,
          reason: "network_error",
        },
      );
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-purple-300/30 bg-purple-950/20 p-4">
      <h3 className="text-sm font-bold text-purple-100">변호사 검토 요청</h3>
      <input
        value={assignedLawyerName}
        onChange={(event) => setAssignedLawyerName(event.target.value)}
        placeholder="배정 변호사명 선택 또는 입력"
        className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-300"
      />
      <textarea
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        placeholder="검토 요청 메모"
        className="mt-3 min-h-20 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none focus:border-purple-300"
      />
      <button
        type="button"
        onClick={() => {
          void requestReview();
        }}
        disabled={loading}
        className="mt-3 w-full rounded-xl bg-purple-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40"
      >
        {loading ? "요청 중..." : "변호사 검토 요청"}
      </button>
      {message ? <p className="mt-2 text-xs text-slate-300">{message}</p> : null}
    </div>
  );
}
