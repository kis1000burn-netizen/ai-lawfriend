"use client";

import { useState } from "react";

type Props = {
  caseId: string;
  operationId: string;
  status: string;
  evidenceIntakeStatus?: string | null;
  canAct: boolean;
  onUpdated?: () => Promise<void>;
};

const REVIEWABLE_STATUSES = new Set([
  "CLIENT_RESPONDED",
  "EVIDENCE_INTAKE_LINKED",
  "LAWYER_REVIEWING_RESPONSE",
]);

export function LegalReliabilityActionOperationCompletionControls({
  caseId,
  operationId,
  status,
  evidenceIntakeStatus,
  canAct,
  onUpdated,
}: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!canAct || !REVIEWABLE_STATUSES.has(status)) {
    return null;
  }

  async function submit(
    action: "complete" | "request-more-info" | "reopen" | "defer" | "cancel",
  ) {
    setLoadingAction(action);
    setError(null);

    const endpoint = `/api/cases/${caseId}/legal-reliability/action-operations/${operationId}/${action}`;

    const body =
      action === "complete"
        ? {
            lawyerReviewNote: note,
            completionResult: "RESOLVED",
            evidenceIntakeDecision:
              evidenceIntakeStatus === "UNDER_REVIEW" ? "LAWYER_CONFIRMED" : undefined,
          }
        : {
            lawyerReviewNote: note,
            reason: note,
            requestMoreInfoReason: action === "request-more-info" ? note : undefined,
          };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "요청 실패");
      }

      await onUpdated?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "요청 실패");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div
      className="rounded-xl border border-slate-200 p-3 space-y-3"
      data-testid={`lcc-action-operation-completion-controls-${operationId}`}
    >
      <div>
        <div className="text-sm font-semibold text-slate-900">변호사 완료 검토</div>
        <p className="text-xs text-slate-500">
          의뢰인 응답·업로드 자료는 변호사 검토 후에만 완료 또는 증거 확정 상태로 전환됩니다.
        </p>
      </div>

      <textarea
        className="min-h-24 w-full rounded-lg border border-slate-300 p-2 text-sm"
        placeholder="검토 메모 또는 재요청/보류/취소 사유를 입력하세요."
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
          data-testid={`lcc-action-operation-complete-${operationId}`}
          disabled={Boolean(loadingAction)}
          onClick={() => void submit("complete")}
        >
          {loadingAction === "complete" ? "처리 중…" : "완료 처리"}
        </button>

        <button
          type="button"
          className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-50"
          disabled={Boolean(loadingAction)}
          onClick={() => void submit("request-more-info")}
        >
          추가 요청
        </button>

        <button
          type="button"
          className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-50"
          disabled={Boolean(loadingAction)}
          onClick={() => void submit("reopen")}
        >
          재개
        </button>

        <button
          type="button"
          className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-50"
          disabled={Boolean(loadingAction)}
          onClick={() => void submit("defer")}
        >
          보류
        </button>

        <button
          type="button"
          className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-50"
          disabled={Boolean(loadingAction)}
          onClick={() => void submit("cancel")}
        >
          취소
        </button>
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
