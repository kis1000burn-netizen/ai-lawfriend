import { created, ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { createManualDeadlineService } from "@/features/litigation-deadline-reminder/litigation-deadline-reminder.service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = caseIdParamSchema.parse(await context.params);
    const body = await request.json();
    const result = await createManualDeadlineService(currentUser, caseId, body);
    return created(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
