import { NextRequest } from "next/server";
import { z } from "zod";

import {
  createVoicePrivacyOpsRequest,
  listVoicePrivacyOpsRequests,
} from "@/features/voice/voice-ops.service";
import {
  createVoicePrivacyOpsRequestBodySchema,
  voicePrivacyOpsRequestListQuerySchema,
} from "@/features/voice/voice-ops.api.validators";
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
 * Phase 7-A — Voice 삭제·정정·STT 민원 운영 티켓.
 * GET/POST `/api/admin/voice/privacy-requests`
 */
export async function GET(req: NextRequest) {
  try {
    await requireStaffOrPlatformAdminApi();

    const query = voicePrivacyOpsRequestListQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );

    const items = await listVoicePrivacyOpsRequests({
      status: query.status,
      requestType: query.requestType,
      caseId: query.caseId,
      limit: query.limit,
    });

    return ok({ items });
  } catch (error: unknown) {
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    const body = createVoicePrivacyOpsRequestBodySchema.parse(await req.json());
    const requestRow = await createVoicePrivacyOpsRequest(user, body);
    return ok({ request: requestRow }, { status: 201 });
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
