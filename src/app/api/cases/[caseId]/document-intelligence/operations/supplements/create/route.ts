import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { createSupplementFromReviewItemService } from "@/features/document-intelligence/litigation-operations.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);
    const body = await request.json();

    const result = await createSupplementFromReviewItemService(
      currentUser,
      caseId,
      body,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
