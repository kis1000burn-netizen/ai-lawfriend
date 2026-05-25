import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { getLegalReliabilityActionOperationsDashboardService } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard-summary.service";
import {
  legalReliabilityActionOperationDashboardFilterSchema,
  legalReliabilityActionOperationDashboardSummarySchema,
} from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard.schema";
import { legalReliabilityActionLoopCaseParamSchema } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.api.validators";

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
    const filter = legalReliabilityActionOperationDashboardFilterSchema.optional().parse(
      url.searchParams.get("filter") ?? undefined,
    );

    const summary = await getLegalReliabilityActionOperationsDashboardService(
      currentUser,
      caseId,
      filter,
    );

    return ok({
      summary: legalReliabilityActionOperationDashboardSummarySchema.parse(summary),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
