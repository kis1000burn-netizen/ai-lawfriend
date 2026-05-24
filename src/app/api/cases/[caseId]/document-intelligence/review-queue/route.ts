import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { getDocumentIntelligenceReviewQueueService } from "@/features/document-intelligence/document-intelligence-review.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const result = await getDocumentIntelligenceReviewQueueService(
      currentUser,
      caseId,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
