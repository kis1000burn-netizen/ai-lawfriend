import Link from "next/link";
import { notFound } from "next/navigation";
import { VoicePrivacyOpsRequestDetailPanel } from "@/components/admin/voice/voice-privacy-ops-request-detail-panel";
import { getVoicePrivacyOpsRequestById } from "@/features/voice/voice-ops.service";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";
import { NotFoundError } from "@/lib/errors";

type PageProps = {
  params: Promise<{ requestId: string }>;
};

export default async function AdminVoicePrivacyOpsRequestDetailPage({ params }: PageProps) {
  await requireStaffOrPlatformAdminPage();
  const { requestId } = await params;

  let request;
  try {
    request = await getVoicePrivacyOpsRequestById(requestId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/voice/privacy-requests"
          className="text-sm font-medium text-aibeop-muted hover:text-aibeop-text"
        >
          ← 요청 목록
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-aibeop-text">Voice 민원 처리</h1>
        <p className="mt-1 font-mono text-xs text-aibeop-subtle">{request.id}</p>
      </div>
      <VoicePrivacyOpsRequestDetailPanel
        request={{
          id: request.id,
          caseId: request.caseId,
          voiceTranscriptId: request.voiceTranscriptId,
          requestType: request.requestType,
          status: request.status,
          requesterChannel: request.requesterChannel,
          requesterNote: request.requesterNote,
          opsNotes: request.opsNotes,
          resolutionCode: request.resolutionCode,
          evidenceTag: request.evidenceTag,
          voiceTranscript: request.voiceTranscript,
        }}
      />
    </div>
  );
}
