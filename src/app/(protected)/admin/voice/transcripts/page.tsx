import Link from "next/link";
import { VoiceTranscriptOpsList } from "@/components/admin/voice/voice-transcript-ops-list";
import { VoiceTranscriptOpsSummaryCards } from "@/components/admin/voice/voice-transcript-ops-summary-cards";
import {
  getVoiceTranscriptOpsSummary,
  listVoiceTranscriptOpsRows,
} from "@/features/voice/voice-ops.service";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";
import type { VoiceTranscriptStatus } from "@prisma/client";

type PageProps = {
  searchParams?: Promise<Partial<Record<string, string | string[] | undefined>>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminVoiceTranscriptOpsPage({ searchParams }: PageProps) {
  await requireStaffOrPlatformAdminPage();

  const sp = searchParams ? await searchParams : {};
  const statusRaw = firstParam(sp.status)?.trim();
  const ttlOverdueOnly = firstParam(sp.ttlOverdueOnly) === "1";

  const summary = await getVoiceTranscriptOpsSummary();
  const items = await listVoiceTranscriptOpsRows({
    status: statusRaw as VoiceTranscriptStatus | undefined,
    ttlOverdueOnly,
    limit: 100,
  });

  return (
    <div className="space-y-6" data-testid="voice-transcript-ops-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-aibeop-text">Voice Transcript 운영</h1>
          <p className="mt-1 text-sm text-aibeop-muted">
            Phase 7-A — transcript 메타·TTL backlog·trace 집계만 표시합니다. `draftText` 본문은 노출하지
            않습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/voice/privacy-requests"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            삭제·정정 요청
          </Link>
          <Link
            href="/admin/operations/aibeopchin-7-dashboard"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            운영 대시보드
          </Link>
        </div>
      </div>

      <VoiceTranscriptOpsSummaryCards summary={summary} />

      <form action="/admin/voice/transcripts" method="get" className="flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={statusRaw ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">전체 상태</option>
          <option value="CAPTURED">CAPTURED</option>
          <option value="NEEDS_CONFIRMATION">NEEDS_CONFIRMATION</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-aibeop-subtle">
          <input type="checkbox" name="ttlOverdueOnly" value="1" defaultChecked={ttlOverdueOnly} />
          TTL 초과 초안만
        </label>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          필터
        </button>
      </form>

      <VoiceTranscriptOpsList items={items} />
    </div>
  );
}
