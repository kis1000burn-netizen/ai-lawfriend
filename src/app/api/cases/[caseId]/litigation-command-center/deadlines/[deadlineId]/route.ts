import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { updateCommandCenterDeadlineService } from "@/features/document-intelligence/litigation-command-center-actions.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = caseIdParamSchema.extend({
  deadlineId: z.string().cuid(),
});

type RouteContext = {
  params: Promise<{ caseId: string; deadlineId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, deadlineId } = paramsSchema.parse(params);
    const body = await request.json();

    const result = await updateCommandCenterDeadlineService(
      currentUser,
      caseId,
      deadlineId,
      body,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
