"use client";

import Link from "next/link";
import type { VoiceTranscriptOpsSummary } from "@/features/voice/voice-ops.service";

type Props = {
  summary: VoiceTranscriptOpsSummary;
};

export function VoiceTranscriptOpsSummaryCards({ summary }: Readonly<Props>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">전체 transcript</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900" data-testid="voice-ops-total">
          {summary.total}
        </p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">TTL 초과 초안</p>
        <p className="mt-2 text-2xl font-semibold text-amber-950" data-testid="voice-ops-ttl-overdue">
          {summary.ttlOverdueCount}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CONFIRMED</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-800">{summary.byStatus.CONFIRMED}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">미결 privacy 요청</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900" data-testid="voice-ops-open-privacy">
          {summary.openPrivacyOpsCount}
        </p>
        <Link
          href="/admin/voice/privacy-requests"
          className="mt-2 inline-block text-xs font-medium text-slate-700 underline"
        >
          요청 처리 →
        </Link>
      </div>
    </div>
  );
}
