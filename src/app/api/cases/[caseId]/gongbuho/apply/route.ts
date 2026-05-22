import { z } from "zod";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError } from "@/lib/errors";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { applyGongbuhoToCase } from "@/features/gongbuho/gongbuho-packet.service";
import { caseApplyGongbuhoBodySchema } from "@/lib/validators/gongbuho";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function POST(req: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const access = await getCaseAccessContext(currentUser, caseId);
    if (!access.canWriteCase) {
      throw new ForbiddenError(
        "공부호를 적용하려면 해당 사건에 대한 수정 권한이 필요합니다.",
      );
    }

    const bodyRaw = await req.json().catch(() => ({}));
    let explicit: { code?: string; version?: string };
    try {
      explicit = caseApplyGongbuhoBodySchema.parse(bodyRaw);
    } catch (e: unknown) {
      if (e instanceof z.ZodError) {
        return fail("요청 형식이 올바르지 않습니다.", 400, {
          code: "VALIDATION_ERROR",
          details: e.flatten(),
        });
      }
      throw e;
    }

    const caseMeta = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        category: true,
        status: true,
        title: true,
      },
    });
    if (!caseMeta) {
      return fail("사건을 찾을 수 없습니다.", 404, { code: "NOT_FOUND" });
    }

    const result = await applyGongbuhoToCase({
      caseId,
      actorUserId: currentUser.id,
      caseSnapshot: {
        category: caseMeta.category,
        status: caseMeta.status,
        title: caseMeta.title,
      },
      explicit:
        explicit.code && explicit.version
          ? { code: explicit.code, version: explicit.version }
          : undefined,
    });

    return ok(result, { status: 201 });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
