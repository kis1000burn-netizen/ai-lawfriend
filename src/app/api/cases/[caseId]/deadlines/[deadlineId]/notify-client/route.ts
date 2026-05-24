import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { scheduleDeadlineClientNotificationsService } from "@/features/litigation-deadline-reminder/litigation-deadline-reminder.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = caseIdParamSchema.extend({
  deadlineId: z.string().cuid(),
});

type RouteContext = { params: Promise<{ caseId: string; deadlineId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId, deadlineId } = paramsSchema.parse(await context.params);
    const body = await request.json().catch(() => ({}));
    const result = await scheduleDeadlineClientNotificationsService(
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
