import { z } from "zod";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { writeGongbuhoAuditLog } from "@/lib/gongbuho/gongbuho-audit-log";
import { projectGongbuhoPacketToQuestionSetDraft } from "@/features/gongbuho/project-gongbuho-question-set.service";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  gongbuhoId: z.string().cuid("유효한 공부호 ID가 아닙니다."),
});

type RouteContext = {
  params: Promise<{ gongbuhoId: string }>;
};

/**
 * POST /api/admin/gongbuho/[gongbuhoId]/question-set/project
 * `APPROVED` 패킷의 `questionFlow`만 `QuestionSet` DRAFT로 저장(중복 시 409).
 * ADMIN·SUPER_ADMIN 전용(STAFF 불가 · `assertGongbuhoOperation`· AuditLog 장착).
 * @see docs/gongbuho/GONGBUHO_QUESTION_SET_PROJECTION.md
 */
export async function POST(_req: Request, context: RouteContext) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "PROJECT_QUESTION_SET");

    const { gongbuhoId } = paramsSchema.parse(await context.params);

    const data = await projectGongbuhoPacketToQuestionSetDraft({
      gongbuhoPacketId: gongbuhoId,
    });

    await writeGongbuhoAuditLog({
      actorUserId: user.id,
      event: "GONGBUHO_QUESTION_SET_PROJECTED",
      entityType: "QUESTION_SET",
      entityId: data.questionSet.id,
      metadata: {
        gongbuhoPacketId: data.gongbuhoPacket.id,
        packetCode: data.gongbuhoPacket.code,
        packetVersion: data.gongbuhoPacket.version,
        role: user.role,
        projectedAtIso: new Date().toISOString(),
      },
    });

    return ok(data, { status: 201 });
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
