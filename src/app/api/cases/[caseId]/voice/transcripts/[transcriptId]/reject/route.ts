import { NextRequest } from "next/server";

import { rejectVoiceTranscriptDraft } from "@/features/voice/voice-transcript.service";
import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string; transcriptId: string }> };

/** Phase 5-D — 사용자 거절: 인터뷰 무변경 · `VOICE_TRANSCRIPT_REJECTED` trace만 남김. */
export async function POST(_req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { caseId, transcriptId } = await ctx.params;
    const row = await rejectVoiceTranscriptDraft(user, caseId, transcriptId);

    return ok({
      transcript: {
        id: row.id,
        status: row.status,
        rejectedAt: row.rejectedAt?.toISOString() ?? null,
      },
    });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
