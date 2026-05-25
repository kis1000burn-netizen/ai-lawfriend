/**
 * Product Phase 50-D — Completion decision API route factory.
 */
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { reviewLegalReliabilityActionOperationCompletionService } from "./legal-reliability-action-operation-completion.service";
import {
  completionReasonBodySchema,
  type LegalReliabilityActionOperationCompletionDecision,
} from "./legal-reliability-action-operation-completion.schema";
import { legalReliabilityActionOperationSchema } from "./legal-reliability-action-operation.schema";
import { legalReliabilityActionLoopCaseParamSchema } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.api.validators";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ caseId: string; operationId: string }>;
};

export function makeCompletionDecisionRouteHandler(config: {
  decision: LegalReliabilityActionOperationCompletionDecision;
  reasonField: "reopenReason" | "deferReason" | "cancelReason" | "requestMoreInfoReason";
}) {
  return async function POST(request: Request, context: RouteContext) {
    try {
      const currentUser = await requireSessionUser();
      const params = await context.params;
      const { caseId } = legalReliabilityActionLoopCaseParamSchema.parse(params);
      const operationId = z.string().min(1).parse(params.operationId);
      const body = completionReasonBodySchema.parse(await request.json());

      const result = await reviewLegalReliabilityActionOperationCompletionService(
        currentUser,
        caseId,
        operationId,
        {
          decision: config.decision,
          lawyerReviewNote: body.lawyerReviewNote ?? body.reason,
          [config.reasonField]: body.reason,
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
  };
}
