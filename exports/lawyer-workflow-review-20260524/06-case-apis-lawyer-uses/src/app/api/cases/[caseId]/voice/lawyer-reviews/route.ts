import { NextRequest } from "next/server";

import { voiceLawyerReviewMutationBodySchema } from "@/features/voice/voice-lawyer-review.api.validators";
import { setLawyerVoiceReviewCompletion } from "@/features/voice/voice-lawyer-review.service";
import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string }> };

/**
 * Phase 5-H-UI-3 — 변호사 음성 transcript 검토 완료 플래그 저장.
 */
export async function POST(req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const body = voiceLawyerReviewMutationBodySchema.parse(await req.json().catch(() => ({})));
    const { caseId } = await ctx.params;

    const result = await setLawyerVoiceReviewCompletion(user, caseId, body);

    return ok(result);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
