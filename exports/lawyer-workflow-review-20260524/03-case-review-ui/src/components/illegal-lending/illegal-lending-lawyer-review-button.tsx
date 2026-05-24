"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCurrentIllegalLendingPromoVariant } from "@/features/illegal-lending/promo/illegal-lending-current-variant";
import { trackIllegalLendingPromoEvent } from "@/features/illegal-lending/promo/illegal-lending-promo-analytics";
import { ILLEGAL_LENDING_PROMO_EVENTS } from "@/features/illegal-lending/promo/illegal-lending-promo-events";

export function IllegalLendingLawyerReviewButton({
  reportId,
}: Readonly<{
  reportId: string;
}>) {
  const router = useRouter();
  const [memo, setMemo] = useState("");
  const [assignedLawyerName, setAssignedLawyerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function requestReview() {
    setLoading(true);
    setMessage("");

    try {
      trackIllegalLendingPromoEvent(
        ILLEGAL_LENDING_PROMO_EVENTS.LAWYER_REVIEW_REQUEST_ATTEMPT,
        {
          source: "admin_lawyer_review",
          variant: getCurrentIllegalLendingPromoVariant(),
          reportId,
          hasAssignedLawyerName: Boolean(assignedLawyerName.trim()),
        },
      );

      const res = await fetch(
        `/api/admin/illegal-lending-reports/${reportId}/lawyer-review`,
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
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        trackIllegalLendingPromoEvent(
          ILLEGAL_LENDING_PROMO_EVENTS.LAWYER_REVIEW_REQUEST_FAIL,
          {
            source: "admin_lawyer_review",
            variant: getCurrentIllegalLendingPromoVariant(),
            reportId,
            reason: data.message || "response_not_ok",
          },
        );
        setMessage(data.message || "변호사 검토 요청에 실패했습니다.");
        return;
      }

      trackIllegalLendingPromoEvent(
        ILLEGAL_LENDING_PROMO_EVENTS.LAWYER_REVIEW_REQUEST_SUCCESS,
        {
          source: "admin_lawyer_review",
          variant: getCurrentIllegalLendingPromoVariant(),
          reportId,
          hasAssignedLawyerName: Boolean(assignedLawyerName.trim()),
        },
      );

      setMessage("변호사 검토 요청이 생성되었습니다.");
      setMemo("");
      setAssignedLawyerName("");
      router.refresh();
    } catch {
      trackIllegalLendingPromoEvent(
        ILLEGAL_LENDING_PROMO_EVENTS.LAWYER_REVIEW_REQUEST_FAIL,
        {
          source: "admin_lawyer_review",
          variant: getCurrentIllegalLendingPromoVariant(),
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
    <div className="mt-4 rounded-2xl border border-fuchsia-300/30 bg-fuchsia-950/20 p-4">
      <h3 className="text-sm font-bold text-fuchsia-100">변호사 검토 요청</h3>
      <input
        value={assignedLawyerName}
        onChange={(event) => setAssignedLawyerName(event.target.value)}
        placeholder="배정 변호사명 선택 또는 입력"
        className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-fuchsia-300"
      />
      <textarea
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        placeholder="검토 요청 메모"
        className="mt-3 min-h-20 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none focus:border-fuchsia-300"
      />
      <button
        type="button"
        onClick={() => {
          void requestReview();
        }}
        disabled={loading}
        className="mt-3 w-full rounded-xl bg-fuchsia-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40"
      >
        {loading ? "요청 중..." : "변호사 검토 요청"}
      </button>
      {message ? <p className="mt-2 text-xs text-slate-300">{message}</p> : null}
    </div>
  );
}