import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { adoptCaseConversationMessageAsRecordService } from "@/features/client-portal/case-conversation-adopt.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = caseIdParamSchema.extend({
  messageId: z.string().cuid(),
});

type RouteContext = { params: Promise<{ caseId: string; messageId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId, messageId } = paramsSchema.parse(await context.params);
    const body = await request.json().catch(() => ({}));
    const result = await adoptCaseConversationMessageAsRecordService(
      currentUser,
      caseId,
      messageId,
      body,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
