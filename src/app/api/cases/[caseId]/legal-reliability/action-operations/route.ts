import { ok, created, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  assignLegalReliabilityActionOperationService,
  createLegalReliabilityActionOperationFromApprovedCandidateService,
  listLegalReliabilityActionOperationsService,
  setLegalReliabilityActionOperationDueDateService,
} from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.service";
import {
  assignLegalReliabilityActionOperationInputSchema,
  createLegalReliabilityActionOperationInputSchema,
  legalReliabilityActionOperationSchema,
  listLegalReliabilityActionOperationsQuerySchema,
  setLegalReliabilityActionOperationDueDateInputSchema,
} from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";
import { legalReliabilityActionLoopCaseParamSchema } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.api.validators";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ caseId: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = legalReliabilityActionLoopCaseParamSchema.parse(params);
    const url = new URL(request.url);
    const filters = listLegalReliabilityActionOperationsQuerySchema.parse({
      assignedToUserId: url.searchParams.get("assignedToUserId") ?? undefined,
      priority: url.searchParams.get("priority") ?? undefined,
      slaStatus: url.searchParams.get("slaStatus") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      dueBefore: url.searchParams.get("dueBefore") ?? undefined,
      dueAfter: url.searchParams.get("dueAfter") ?? undefined,
      hasClientResponse: url.searchParams.get("hasClientResponse") ?? undefined,
      evidenceIntakeStatus: url.searchParams.get("evidenceIntakeStatus") ?? undefined,
    });

    const operations = await listLegalReliabilityActionOperationsService(
      currentUser,
      caseId,
      filters,
    );

    return ok({
      operations: z.array(legalReliabilityActionOperationSchema).parse(operations),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = legalReliabilityActionLoopCaseParamSchema.parse(params);
    const body = createLegalReliabilityActionOperationInputSchema.parse(await request.json());

    const operation = await createLegalReliabilityActionOperationFromApprovedCandidateService({
      actor: currentUser,
      caseId,
      sourceActionCandidateId: body.sourceActionCandidateId,
    });

    return created({ operation: legalReliabilityActionOperationSchema.parse(operation) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
