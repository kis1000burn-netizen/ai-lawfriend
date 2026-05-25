import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { decideEvidenceRequestCandidateInputSchema } from "@/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.schema";
import { decideEvidenceRequestCandidateService } from "@/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.service";
import { legalReliabilityActionLoopCandidateParamSchema } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.api.validators";

type RouteContext = {
  params: Promise<{ caseId: string; candidateId: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, candidateId } = legalReliabilityActionLoopCandidateParamSchema.parse(params);
    const body = await request.json();
    const input = decideEvidenceRequestCandidateInputSchema.parse(body);

    const result = await decideEvidenceRequestCandidateService(
      currentUser,
      caseId,
      candidateId,
      input,
    );

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
