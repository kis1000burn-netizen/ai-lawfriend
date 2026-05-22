import { z } from "zod";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { prisma } from "@/lib/prisma";
import { projectGongbuhoQuestionFlowToQuestions } from "@/features/gongbuho/project-gongbuho-question-flow";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  gongbuhoId: z.string().cuid("유효한 공부호 ID가 아닙니다."),
});

type RouteContext = {
  params: Promise<{ gongbuhoId: string }>;
};

/**
 * POST /api/admin/gongbuho/[gongbuhoId]/question-flow/preview
 * 패킷 `packetJson.questionFlow`를 인터뷰 `QuestionSetQuestion[]`로 투영(저장 없음).
 * 패킷 상태 무관(DRAFT–ARCHIVED 허용).
 * @see docs/gongbuho/GONGBUHO_QUESTION_FLOW_PROJECTION.md
 */
export async function POST(_req: Request, context: RouteContext) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "PREVIEW");

    const { gongbuhoId } = paramsSchema.parse(await context.params);

    const packet = await prisma.gongbuhoPacket.findUnique({
      where: { id: gongbuhoId },
      select: {
        id: true,
        code: true,
        version: true,
        status: true,
        caseType: true,
        packetJson: true,
      },
    });

    if (!packet) {
      return fail("공부호 패킷을 찾을 수 없습니다.", 404, { code: "NOT_FOUND" });
    }

    const questions = projectGongbuhoQuestionFlowToQuestions(packet.packetJson);

    return ok({
      source: "GONGBUHO" as const,
      gongbuhoPacket: {
        id: packet.id,
        code: packet.code,
        version: packet.version,
        status: packet.status,
        caseType: packet.caseType,
      },
      questions,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (
      typeof err.status === "number" &&
      (err.status === 401 || err.status === 403)
    ) {
      return fail(err.message ?? "권한 오류", err.status, {
        code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}
