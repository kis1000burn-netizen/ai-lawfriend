import { NextRequest } from "next/server";

import { voiceSttCaptureBodySchema } from "@/features/voice/voice-transcript.api.validators";
import { createVoiceTranscriptFromSttCapture } from "@/features/voice/voice-transcript.service";
import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string }> };

/**
 * Phase 5-D — 클라이언트/중계 STT 결과를 초안만 저장(UI 확인 전에는 인터뷰 무반영).
 * POST `/api/cases/:caseId/voice/transcripts/stt-capture`
 */
export async function POST(req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const raw = await req.json();
    const body = voiceSttCaptureBodySchema.parse(raw);
    const { caseId } = await ctx.params;

    const row = await createVoiceTranscriptFromSttCapture(user, {
      caseId,
      questionKey: body.questionKey,
      sttDraftText: body.sttDraftText,
      storeOriginalAudio: Boolean(body.storeOriginalAudio),
      originalAudioStorageKey: body.originalAudioStorageKey ?? undefined,
    });

    return ok({
      transcript: {
        id: row.id,
        caseId: row.caseId,
        questionKey: row.questionKey,
        status: row.status,
        draftText: row.draftText,
        expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
      },
    });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
