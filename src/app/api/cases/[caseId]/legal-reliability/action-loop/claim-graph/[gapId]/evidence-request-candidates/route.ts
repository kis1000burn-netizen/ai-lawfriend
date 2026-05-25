import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { createEvidenceRequestCandidateFromGraphGapInputSchema } from "@/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.schema";
import { createEvidenceRequestCandidateFromGraphGapService } from "@/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.service";
import {
  legalReliabilityActionLoopCaseParamSchema,
} from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.api.validators";
import { z } from "zod";

const gapParamSchema = legalReliabilityActionLoopCaseParamSchema.extend({
  gapId: z.string().min(1),
});

type RouteContext = {
  params: Promise<{ caseId: string; gapId: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, gapId } = gapParamSchema.parse(params);
    const body = await request.json();
    const input = createEvidenceRequestCandidateFromGraphGapInputSchema.parse(body);

    const candidate = await createEvidenceRequestCandidateFromGraphGapService(
      currentUser,
      caseId,
      gapId,
      input,
    );

    return ok({ candidate }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
