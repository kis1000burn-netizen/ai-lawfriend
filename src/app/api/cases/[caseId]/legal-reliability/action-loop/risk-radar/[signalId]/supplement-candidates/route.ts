import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  createSupplementCandidateFromRiskRadarInputSchema,
} from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.schema";
import {
  createSupplementCandidateFromRiskRadarService,
  listSupplementActionCandidatesService,
} from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.service";
import {
  legalReliabilityActionLoopCaseParamSchema,
  legalReliabilityActionLoopSignalParamSchema,
} from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.api.validators";

type RouteContext = {
  params: Promise<{ caseId: string; signalId: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, signalId } = legalReliabilityActionLoopSignalParamSchema.parse(params);
    const body = await request.json();
    const input = createSupplementCandidateFromRiskRadarInputSchema.parse(body);

    const candidate = await createSupplementCandidateFromRiskRadarService(
      currentUser,
      caseId,
      signalId,
      input,
    );

    return ok({ candidate }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
