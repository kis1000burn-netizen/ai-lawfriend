import { z } from "zod";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { updateLegalKnowledgeResearchBriefBodySchema } from "@/lib/validators/legal-knowledge-pipeline";
import {
  getLegalKnowledgeResearchBrief,
  updateLegalKnowledgeResearchBrief,
} from "@/features/gongbuho/legal-knowledge-pipeline.service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ briefId: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_READ");
    const { briefId } = await params;
    const brief = await getLegalKnowledgeResearchBrief(briefId);
    return ok({ brief });
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

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_WRITE");
    const { briefId } = await params;
    const body = updateLegalKnowledgeResearchBriefBodySchema.parse(
      await req.json(),
    );
    const brief = await updateLegalKnowledgeResearchBrief(
      briefId,
      user.id,
      body,
    );
    return ok({ brief });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return fail("Research Brief 수정 형식이 올바르지 않습니다.", 400, {
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
