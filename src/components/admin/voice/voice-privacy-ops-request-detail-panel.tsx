"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  request: {
    id: string;
    caseId: string;
    voiceTranscriptId: string | null;
    requestType: string;
    status: string;
    requesterChannel: string | null;
    requesterNote: string;
    opsNotes: string | null;
    resolutionCode: string | null;
    evidenceTag: string | null;
    voiceTranscript: { status: string; questionKey: string } | null;
  };
};

export function VoicePrivacyOpsRequestDetailPanel({ request }: Readonly<Props>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(request.status);
  const [opsNotes, setOpsNotes] = useState(request.opsNotes ?? "");
  const [resolutionCode, setResolutionCode] = useState(request.resolutionCode ?? "");

  async function onSave() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/voice/privacy-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          opsNotes: opsNotes.trim() || null,
          resolutionCode: resolutionCode || null,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error?.message ?? "저장에 실패했습니다.");
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="voice-privacy-ops-detail-panel">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-slate-500">유형</dt>
            <dd className="font-medium text-slate-900">{request.requestType}</dd>
          </div>
          <div>
            <dt className="text-slate-500">현재 상태</dt>
            <dd className="font-medium text-slate-900">{request.status}</dd>
          </div>
          <div>
            <dt className="text-slate-500">caseId</dt>
            <dd className="font-mono text-xs text-slate-900">{request.caseId}</dd>
          </div>
          <div>
            <dt className="text-slate-500">voiceTranscriptId</dt>
            <dd className="font-mono text-xs text-slate-900">{request.voiceTranscriptId ?? "—"}</dd>
          </div>
          {request.voiceTranscript ? (
            <>
              <div>
                <dt className="text-slate-500">transcript 상태</dt>
                <dd className="font-medium text-slate-900">{request.voiceTranscript.status}</dd>
              </div>
              <div>
                <dt className="text-slate-500">questionKey</dt>
                <dd className="font-mono text-xs text-slate-900">{request.voiceTranscript.questionKey}</dd>
              </div>
            </>
          ) : null}
          <div className="md:col-span-2">
            <dt className="text-slate-500">요청 메모</dt>
            <dd className="mt-1 whitespace-pre-wrap text-slate-900">{request.requesterNote}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">운영 처리 (런북 §7.1/7.2)</h2>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">상태</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            data-testid="voice-privacy-ops-status"
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">resolutionCode (RESOLVED 시 필수)</span>
          <select
            value={resolutionCode}
            onChange={(e) => setResolutionCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            data-testid="voice-privacy-ops-resolution"
          >
            <option value="">— 선택 —</option>
            <option value="DRAFT_PURGED">DRAFT_PURGED (초안 purge)</option>
            <option value="ESCALATED_LAWYER_REVIEW">ESCALATED_LAWYER_REVIEW</option>
            <option value="USER_GUIDED_RECONFIRM">USER_GUIDED_RECONFIRM</option>
            <option value="METADATA_ONLY_CLOSED">METADATA_ONLY_CLOSED</option>
            <option value="REQUEST_REJECTED">REQUEST_REJECTED</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">opsNotes (본문 transcript 금지)</span>
          <textarea
            value={opsNotes}
            onChange={(e) => setOpsNotes(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          data-testid="voice-privacy-ops-save"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </div>
  );
}
