import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { getCaseGongbuhoCandidates } from "@/features/gongbuho/gongbuho-case-candidate.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

/**
 * GET /api/cases/[caseId]/gongbuho/candidates
 * 사건 카테고리별 APPROVED 공부호 후보·선택 정책·최근 적용 Trace 요약.
 * @see docs/gongbuho/GONGBUHO_CASE_BINDING.md
 */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    await getCaseAccessContext(currentUser, caseId);

    const data = await getCaseGongbuhoCandidates(caseId);
    if (!data) {
      return fail("사건을 찾을 수 없습니다.", 404, { code: "NOT_FOUND" });
    }

    return ok(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
