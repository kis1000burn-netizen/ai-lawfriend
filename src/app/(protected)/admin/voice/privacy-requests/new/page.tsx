import Link from "next/link";
import { VoicePrivacyOpsRequestCreatePanel } from "@/components/admin/voice/voice-privacy-ops-request-create-panel";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";

export default async function AdminVoicePrivacyOpsRequestNewPage() {
  await requireStaffOrPlatformAdminPage();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/voice/privacy-requests"
          className="text-sm font-medium text-aibeop-muted hover:text-aibeop-text"
        >
          ← 요청 목록
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-aibeop-text">Voice 민원 요청 등록</h1>
        <p className="mt-1 text-sm text-aibeop-muted">
          의뢰인 식별·요청 근거만 기록합니다. STT/transcript 본문은 입력·저장하지 마세요.
        </p>
      </div>
      <VoicePrivacyOpsRequestCreatePanel />
    </div>
  );
}
