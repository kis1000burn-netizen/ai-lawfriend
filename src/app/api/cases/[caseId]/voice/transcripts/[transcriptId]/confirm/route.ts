import { NextRequest } from "next/server";

import { voiceTranscriptConfirmBodySchema } from "@/features/voice/voice-transcript.api.validators";
import { confirmVoiceTranscriptAndBindInterviewAnswer } from "@/features/voice/voice-transcript.service";
import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string; transcriptId: string }> };

/**
 * Phase 5-D — 사용자 확인 후 `CONFIRMED`로 전환하고 인터뷰 답변 저장(`saveInterviewAnswer`) + trace append.
 */
export async function POST(req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const raw = await req.json().catch(() => ({}));
    const body = voiceTranscriptConfirmBodySchema.parse(raw);
    const { caseId, transcriptId } = await ctx.params;

    const row = await confirmVoiceTranscriptAndBindInterviewAnswer(
      user,
      caseId,
      transcriptId,
      body.confirmedText,
    );

    return ok({
      transcript: {
        id: row.id,
        caseId: row.caseId,
        questionKey: row.questionKey,
        status: row.status,
        confirmedAt: row.confirmedAt?.toISOString() ?? null,
      },
    });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
