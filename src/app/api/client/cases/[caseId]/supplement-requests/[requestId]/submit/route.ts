import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { submitClientSupplementService } from "@/features/client-portal/client-submission.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = caseIdParamSchema.extend({
  requestId: z.string().cuid(),
});

type RouteContext = { params: Promise<{ caseId: string; requestId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId, requestId } = paramsSchema.parse(await context.params);
    const body = await request.json();
    const result = await submitClientSupplementService(
      currentUser,
      caseId,
      requestId,
      body,
    );
    return ok(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
