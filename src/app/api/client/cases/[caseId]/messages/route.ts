import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import {
  listCaseConversationMessagesService,
  postCaseConversationMessageService,
} from "@/features/client-portal/case-conversation.service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = caseIdParamSchema.parse(await context.params);
    const url = new URL(request.url);
    const threadId = url.searchParams.get("threadId") ?? undefined;
    const items = await listCaseConversationMessagesService(currentUser, caseId, threadId);
    return ok({ items });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = caseIdParamSchema.parse(await context.params);
    const body = await request.json();
    const message = await postCaseConversationMessageService(currentUser, caseId, body, {
      clientPortal: true,
    });
    return ok(message, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
