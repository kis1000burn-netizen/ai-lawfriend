import { NextRequest } from "next/server";

import { voiceLawyerSupplementQuestionBodySchema } from "@/features/voice/voice-lawyer-supplement.api.validators";
import { createVoiceLawyerSupplementQuestion } from "@/features/voice/voice-lawyer-supplement.service";
import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string }> };

/**
 * Phase 5-H-UI-4 — Voice lawyer review에서 Supplement question 생성·발송.
 */
export async function POST(req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const body = voiceLawyerSupplementQuestionBodySchema.parse(await req.json().catch(() => ({})));
    const { caseId } = await ctx.params;

    const result = await createVoiceLawyerSupplementQuestion(user, caseId, body);

    return ok(result, { status: 201 });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
