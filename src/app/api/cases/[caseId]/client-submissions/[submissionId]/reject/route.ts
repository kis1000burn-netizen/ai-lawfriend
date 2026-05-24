import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { rejectClientSubmissionService } from "@/features/client-portal/client-submission.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = caseIdParamSchema.extend({
  submissionId: z.string().cuid(),
});

type RouteContext = { params: Promise<{ caseId: string; submissionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId, submissionId } = paramsSchema.parse(await context.params);
    const body = await request.json().catch(() => ({}));
    const result = await rejectClientSubmissionService(
      currentUser,
      caseId,
      submissionId,
      body,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
