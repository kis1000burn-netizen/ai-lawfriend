import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { getClientPortalCaseService } from "@/features/client-portal/client-portal.service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = caseIdParamSchema.parse(await context.params);
    const summary = await getClientPortalCaseService(currentUser, caseId);
    return ok(summary);
  } catch (error) {
    return toErrorResponse(error);
  }
}
