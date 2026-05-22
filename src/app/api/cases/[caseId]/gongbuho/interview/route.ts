import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { getCaseGongbuhoInterview } from "@/features/gongbuho/gongbuho-interview-binding.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

/**
 * GET /api/cases/[caseId]/gongbuho/interview
 * 사건 Gongbuho 인터뷰 바인딩 상태·연결된 질문 목록 조회(`bound:false` 가능).
 */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    await getCaseAccessContext(currentUser, caseId);

    const data = await getCaseGongbuhoInterview(caseId);
    if (!data) {
      return fail("사건을 찾을 수 없습니다.", 404, { code: "NOT_FOUND" });
    }

    return ok(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
