import { z } from "zod";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { cmbRevisionTransitionBodySchema } from "@/lib/validators/aibeopchin-cmb-publish";
import { transitionCmbRevisionStatus } from "@/cmb/publish/cmb-publish-lock.service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ revisionId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    const { revisionId } = await params;
    const body = cmbRevisionTransitionBodySchema.parse(await req.json());

    const revision = await transitionCmbRevisionStatus({
      revisionId,
      toStatus: body.toStatus,
      actor: user,
      changeReason: body.changeReason,
      evidenceTag: body.evidenceTag,
    });

    return ok({ revision });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return fail("전이 요청 형식이 올바르지 않습니다.", 400, {
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      });
    }
    const err = error as Error & { status?: number; statusCode?: number };
    const status = err.status ?? err.statusCode;
    if (status === 401 || status === 403) {
      return fail(err.message, status, {
        code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}
