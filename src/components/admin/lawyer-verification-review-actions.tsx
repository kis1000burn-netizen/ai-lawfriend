"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readJsonApiErrorMessage } from "@/lib/client/api-error";

type Props = Readonly<{
  lawyerProfileId: string;
}>;

export function LawyerVerificationReviewActions({ lawyerProfileId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function patchStatus(verificationStatus: string) {
    setError("");
    setPending(true);
    try {
      const res = await fetch(`/api/admin/lawyer-verifications/${lawyerProfileId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationStatus,
          rejectionReason: note.trim().length > 0 ? note.trim() : null,
        }),
      });
      const json: unknown = await res.json();
      if (!res.ok || !json || typeof json !== "object" || (json as { ok?: boolean }).ok !== true) {
        setError(readJsonApiErrorMessage(json, "처리에 실패했습니다."));
        return;
      }
      setNote("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  function onApprove() {
    void patchStatus("APPROVED");
  }

  function onNeedsMore() {
    if (!note.trim()) {
      setError("보완 요청 시 의뢰인·변호사에게 보일 안내를 입력해 주세요.");
      return;
    }
    void patchStatus("NEEDS_MORE_INFO");
  }

  function onReject() {
    if (!note.trim()) {
      setError("반려 시 사유(안내 문구)를 입력해 주세요.");
      return;
    }
    void patchStatus("REJECTED");
  }

  function onSuspend() {
    if (!note.trim()) {
      setError("정지(SUSPENDED) 시 사유(운영 기록·안내)를 입력해 주세요.");
      return;
    }
    void patchStatus("SUSPENDED");
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">심사 처리</h2>
      <p className="text-xs leading-relaxed text-slate-600">
        <strong className="text-slate-800">승인</strong>은 안내 문구 없이 가능합니다.{" "}
        <strong className="text-slate-800">보완 요청·반려·정지(SUSPENDED)</strong>는 아래 문구가
        변호사 화면 안내·감사 기록에 남습니다. 정지·반려는 특히 사유를 구체적으로 적어 주세요.
      </p>
      <label className="block text-xs font-medium text-slate-700" htmlFor="lv-review-note">
        운영자 안내 / 반려·보완·정지 사유
      </label>
      <textarea
        id="lv-review-note"
        className="min-h-[100px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        placeholder="보완 요청·반려·정지 시 필수. 승인만 생략 가능."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={pending}
      />
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onApprove}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          승인 (APPROVED)
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onNeedsMore}
          className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-amber-950 hover:bg-amber-600 disabled:opacity-50"
        >
          보완 요청 (NEEDS_MORE_INFO)
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onReject}
          className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          반려 (REJECTED)
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onSuspend}
          className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50"
        >
          정지 (SUSPENDED)
        </button>
      </div>
    </div>
  );
}
