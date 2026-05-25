import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { listSupplementActionCandidatesService } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.service";
import { legalReliabilityActionLoopCaseParamSchema } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.api.validators";

type RouteContext = {
  params: Promise<{ caseId: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = legalReliabilityActionLoopCaseParamSchema.parse(params);

    const candidates = await listSupplementActionCandidatesService(currentUser, caseId);

    return ok({ candidates });
  } catch (error) {
    return toErrorResponse(error);
  }
}
