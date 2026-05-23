import Link from "next/link";
import { VoicePrivacyOpsRequestList } from "@/components/admin/voice/voice-privacy-ops-request-list";
import { listVoicePrivacyOpsRequests } from "@/features/voice/voice-ops.service";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";
import type { VoicePrivacyOpsRequestStatus } from "@prisma/client";

type PageProps = {
  searchParams?: Promise<Partial<Record<string, string | string[] | undefined>>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminVoicePrivacyOpsRequestsPage({ searchParams }: PageProps) {
  await requireStaffOrPlatformAdminPage();

  const sp = searchParams ? await searchParams : {};
  const statusRaw = firstParam(sp.status)?.trim();

  const rows = await listVoicePrivacyOpsRequests(
    statusRaw ? { status: statusRaw as VoicePrivacyOpsRequestStatus } : undefined,
  );

  return (
    <div className="space-y-6" data-testid="voice-privacy-ops-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-aibeop-text">Voice 삭제·정정·STT 민원</h1>
          <p className="mt-1 text-sm text-aibeop-muted">
            런북 §7.1〜7.3 — 운영 티켓 등록·처리. transcript 본문은 저장·표시하지 않습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/voice/privacy-requests/new"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            data-testid="voice-privacy-ops-new-link"
          >
            + 요청 등록
          </Link>
          <Link
            href="/admin/voice/transcripts"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            Transcript 운영
          </Link>
        </div>
      </div>

      <form action="/admin/voice/privacy-requests" method="get" className="flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={statusRaw ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">전체 상태</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_REVIEW">IN_REVIEW</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          필터
        </button>
      </form>

      <VoicePrivacyOpsRequestList
        items={rows.map((r) => ({
          id: r.id,
          caseId: r.caseId,
          voiceTranscriptId: r.voiceTranscriptId,
          requestType: r.requestType,
          status: r.status,
          requesterChannel: r.requesterChannel,
          requesterNote: r.requesterNote,
          resolutionCode: r.resolutionCode,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
