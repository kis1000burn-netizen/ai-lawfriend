import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { reviewLegalReliabilityActionOperationCompletionService } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-completion.service";
import {
  requestMoreInfoLegalReliabilityActionOperationBodySchema,
} from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-completion.schema";
import { legalReliabilityActionOperationSchema } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";
import { legalReliabilityActionLoopCaseParamSchema } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.api.validators";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ caseId: string; operationId: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = legalReliabilityActionLoopCaseParamSchema.parse(params);
    const operationId = z.string().min(1).parse(params.operationId);
    const body = requestMoreInfoLegalReliabilityActionOperationBodySchema.parse(await request.json());

    const result = await reviewLegalReliabilityActionOperationCompletionService(
      currentUser,
      caseId,
      operationId,
      {
        decision: "REQUEST_MORE_INFO",
        completionResult: "NEEDS_MORE_INFO",
        requestMoreInfoReason: body.requestMoreInfoReason ?? body.lawyerReviewNote,
        lawyerReviewNote: body.lawyerReviewNote,
        evidenceIntakeDecision: body.evidenceIntakeDecision ?? "NEEDS_MORE_REVIEW",
      },
    );

    return ok({
      operation: legalReliabilityActionOperationSchema.parse(result.operation),
      nextStatus: result.nextStatus,
      completionResult: result.completionResult,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
