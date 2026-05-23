import { NextRequest } from "next/server";
import { z } from "zod";

import {
  getVoicePrivacyOpsRequestById,
  updateVoicePrivacyOpsRequest,
} from "@/features/voice/voice-ops.service";
import { updateVoicePrivacyOpsRequestBodySchema } from "@/features/voice/voice-ops.api.validators";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ requestId: string }> };

function handleAuthError(error: unknown) {
  const err = error as Error & { status?: number };
  if (typeof err.status === "number" && (err.status === 401 || err.status === 403)) {
    return fail(err.message ?? "권한 오류", err.status, {
      code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
    });
  }
  return null;
}

export async function GET(_req: NextRequest, ctx: Params) {
  try {
    await requireStaffOrPlatformAdminApi();
    const { requestId } = await ctx.params;
    const requestRow = await getVoicePrivacyOpsRequestById(requestId);
    return ok({ request: requestRow });
  } catch (error: unknown) {
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest, ctx: Params) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    const { requestId } = await ctx.params;
    const body = updateVoicePrivacyOpsRequestBodySchema.parse(await req.json());
    const requestRow = await updateVoicePrivacyOpsRequest(user, requestId, body);
    return ok({ request: requestRow });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return fail("요청 형식이 올바르지 않습니다.", 400, {
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      });
    }
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}
