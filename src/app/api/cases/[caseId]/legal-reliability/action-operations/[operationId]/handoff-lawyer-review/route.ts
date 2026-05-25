import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { handoffLegalReliabilityActionOperationToLawyerReviewService } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-review-handoff.service";
import {
  handoffLegalReliabilityActionOperationReviewInputSchema,
  legalReliabilityActionOperationSchema,
} from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";
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
    const rawBody = await request.text();
    const body = rawBody
      ? handoffLegalReliabilityActionOperationReviewInputSchema.parse(JSON.parse(rawBody))
      : {};

    const result = await handoffLegalReliabilityActionOperationToLawyerReviewService(
      currentUser,
      caseId,
      operationId,
      body,
    );

    return ok({
      operation: legalReliabilityActionOperationSchema.parse(result.operation),
      reviewItem: result.reviewItem,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
