import { z } from "zod";
import {
  requireStaffOrPlatformAdminApi,
} from "@/lib/auth/require-staff-or-platform-admin-api";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { writeGongbuhoAuditLog } from "@/lib/gongbuho/gongbuho-audit-log";
import { approveGongbuhoPacket } from "@/features/gongbuho/gongbuho-packet.service";
import { finalizeLegalKnowledgePipelineOnPacketApproved } from "@/features/gongbuho/legal-knowledge-pipeline.service";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  gongbuhoId: z.string().cuid("유효한 공부호 ID가 아닙니다."),
});

type RouteContext = {
  params: Promise<{ gongbuhoId: string }>;
};

export async function POST(_req: Request, context: RouteContext) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "APPROVE");
    const { gongbuhoId } = paramsSchema.parse(await context.params);

    const result = await approveGongbuhoPacket({ gongbuhoId, approver: user });

    if (!result.alreadyApproved) {
      await writeGongbuhoAuditLog({
        actorUserId: user.id,
        event: "GONGBUHO_PACKET_APPROVED",
        entityType: "GONGBUHO_PACKET",
        entityId: result.packet.id,
        metadata: {
          packetCode: result.packet.code,
          packetVersion: result.packet.version,
          approvedAtIso: result.packet.approvedAt?.toISOString() ?? null,
          role: user.role,
        },
      });

      const pipeline = await finalizeLegalKnowledgePipelineOnPacketApproved({
        gongbuhoPacketId: result.packet.id,
        actorUserId: user.id,
      });
      if (pipeline.completed && pipeline.intakeId) {
        await writeGongbuhoAuditLog({
          actorUserId: user.id,
          event: "GONGBUHO_LEGAL_KNOWLEDGE_PIPELINE_COMPLETED",
          entityType: "LEGAL_KNOWLEDGE_INTAKE",
          entityId: pipeline.intakeId,
          metadata: {
            packetId: result.packet.id,
            code: result.packet.code,
            version: result.packet.version,
            role: user.role,
          },
        });
      }
    }

    return ok(result);
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
