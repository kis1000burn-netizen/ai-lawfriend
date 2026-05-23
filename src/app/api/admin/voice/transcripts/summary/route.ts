import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { getVoiceTranscriptOpsSummary } from "@/features/voice/voice-ops.service";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

function handleAuthError(error: unknown) {
  const err = error as Error & { status?: number };
  if (typeof err.status === "number" && (err.status === 401 || err.status === 403)) {
    return fail(err.message ?? "권한 오류", err.status, {
      code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
    });
  }
  return null;
}

/**
 * Phase 7-A — Voice transcript 운영 요약(TTL backlog · 상태별 집계).
 * GET `/api/admin/voice/transcripts/summary`
 */
export async function GET() {
  try {
    await requireStaffOrPlatformAdminApi();
    const summary = await getVoiceTranscriptOpsSummary();
    return ok({ summary });
  } catch (error: unknown) {
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}
