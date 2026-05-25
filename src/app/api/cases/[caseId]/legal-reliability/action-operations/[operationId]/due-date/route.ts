import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { setLegalReliabilityActionOperationDueDateService } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.service";
import {
  legalReliabilityActionOperationSchema,
  setLegalReliabilityActionOperationDueDateInputSchema,
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
    const body = setLegalReliabilityActionOperationDueDateInputSchema.parse(await request.json());

    const operation = await setLegalReliabilityActionOperationDueDateService(
      currentUser,
      caseId,
      operationId,
      body,
    );

    return ok({ operation: legalReliabilityActionOperationSchema.parse(operation) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
