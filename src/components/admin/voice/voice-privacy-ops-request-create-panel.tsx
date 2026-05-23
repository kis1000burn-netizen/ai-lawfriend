"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function VoicePrivacyOpsRequestCreatePanel() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      caseId: String(form.get("caseId") ?? "").trim(),
      voiceTranscriptId: String(form.get("voiceTranscriptId") ?? "").trim() || null,
      requestType: String(form.get("requestType") ?? "DELETION"),
      requesterChannel: String(form.get("requesterChannel") ?? "").trim() || null,
      requesterNote: String(form.get("requesterNote") ?? "").trim(),
      evidenceTag: String(form.get("evidenceTag") ?? "").trim() || null,
    };

    try {
      const res = await fetch("/api/admin/voice/privacy-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error?.message ?? "요청 등록에 실패했습니다.");
        return;
      }
      router.push(`/admin/voice/privacy-requests/${body.data.request.id}`);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      data-testid="voice-privacy-ops-create-form"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-800">caseId *</span>
          <input
            name="caseId"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            data-testid="voice-privacy-ops-case-id"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">voiceTranscriptId (선택)</span>
          <input
            name="voiceTranscriptId"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">요청 유형 *</span>
          <select
            name="requestType"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            defaultValue="DELETION"
          >
            <option value="DELETION">DELETION (삭제)</option>
            <option value="CORRECTION">CORRECTION (정정)</option>
            <option value="STT_COMPLAINT">STT_COMPLAINT (STT 민원)</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">의뢰인 연락 채널</span>
          <input
            name="requesterChannel"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="email / phone 등"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-slate-800">요청 메모 * (transcript 본문 금지)</span>
        <textarea
          name="requesterNote"
          required
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          data-testid="voice-privacy-ops-requester-note"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-800">evidenceTag (선택)</span>
        <input
          name="evidenceTag"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
        />
      </label>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        data-testid="voice-privacy-ops-create-submit"
      >
        {pending ? "등록 중…" : "요청 등록"}
      </button>
    </form>
  );
}
