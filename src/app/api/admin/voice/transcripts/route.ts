import { NextRequest } from "next/server";

import {
  listVoiceTranscriptOpsRows,
  serializeVoiceTranscriptOpsRowForApi,
} from "@/features/voice/voice-ops.service";
import { voiceOpsTranscriptListQuerySchema } from "@/features/voice/voice-ops.api.validators";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
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
 * Phase 7-A — Voice transcript 운영 목록(메타만 · draftText 미포함).
 * GET `/api/admin/voice/transcripts`
 */
export async function GET(req: NextRequest) {
  try {
    await requireStaffOrPlatformAdminApi();

    const query = voiceOpsTranscriptListQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );

    const items = await listVoiceTranscriptOpsRows({
      status: query.status,
      ttlOverdueOnly: query.ttlOverdueOnly,
      limit: query.limit,
    });

    return ok({
      items: items.map(serializeVoiceTranscriptOpsRowForApi),
    });
  } catch (error: unknown) {
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}
