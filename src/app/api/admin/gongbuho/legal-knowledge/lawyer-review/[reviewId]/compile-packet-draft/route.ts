import { z } from "zod";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { compileLegalKnowledgePacketDraftBodySchema } from "@/lib/validators/legal-knowledge-pipeline";
import { compileLegalKnowledgePacketDraft } from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { writeGongbuhoAuditLog } from "@/lib/gongbuho/gongbuho-audit-log";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ reviewId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_COMPILE");
    const { reviewId } = await params;
    const body = compileLegalKnowledgePacketDraftBodySchema.parse(
      await req.json(),
    );
    const result = await compileLegalKnowledgePacketDraft({
      reviewId,
      currentUserId: user.id,
      body,
    });
    await writeGongbuhoAuditLog({
      actorUserId: user.id,
      event: "GONGBUHO_LEGAL_KNOWLEDGE_PACKET_DRAFT_FROM_PIPELINE",
      entityType: "GONGBUHO_PACKET",
      entityId: result.packet.id,
      metadata: {
        reviewId: result.reviewId,
        intakeId: result.intakeId,
        code: result.packet.code,
        version: result.packet.version,
        role: user.role,
      },
    });
    return ok(
      {
        packet: result.packet,
        reviewId: result.reviewId,
        intakeId: result.intakeId,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return fail("compile-packet-draft 요청 형식이 올바르지 않습니다.", 400, {
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      });
    }
    const err = error as Error & { status?: number };
    if (err.status === 401 || err.status === 403) {
      return fail(err.message, err.status, {
        code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}
