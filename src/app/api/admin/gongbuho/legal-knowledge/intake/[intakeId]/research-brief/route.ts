import { z } from "zod";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { createLegalKnowledgeResearchBriefBodySchema } from "@/lib/validators/legal-knowledge-pipeline";
import {
  createLegalKnowledgeResearchBrief,
  getLegalKnowledgeIntake,
} from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { writeGongbuhoAuditLog } from "@/lib/gongbuho/gongbuho-audit-log";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ intakeId: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_READ");
    const { intakeId } = await params;
    const intake = await getLegalKnowledgeIntake(intakeId);
    return ok({ briefs: intake.researchBriefs });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (err.status === 401 || err.status === 403) {
      return fail(err.message, err.status, {
        code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_WRITE");
    const { intakeId } = await params;
    const body = createLegalKnowledgeResearchBriefBodySchema.parse(
      await req.json(),
    );
    const brief = await createLegalKnowledgeResearchBrief(
      intakeId,
      user.id,
      body,
    );
    await writeGongbuhoAuditLog({
      actorUserId: user.id,
      event: "GONGBUHO_LEGAL_KNOWLEDGE_RESEARCH_BRIEF_CREATED",
      entityType: "LEGAL_KNOWLEDGE_RESEARCH_BRIEF",
      entityId: brief.id,
      metadata: {
        intakeId,
        targetCaseType: brief.targetCaseType,
        role: user.role,
      },
    });
    return ok({ brief }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return fail("Research Brief 요청 형식이 올바르지 않습니다.", 400, {
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
