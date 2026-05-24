import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { receiveClientSubmissionService } from "@/features/client-portal/client-submission.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = caseIdParamSchema.extend({
  submissionId: z.string().cuid(),
});

type RouteContext = { params: Promise<{ caseId: string; submissionId: string }> };

export async function POST(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId, submissionId } = paramsSchema.parse(await context.params);
    const result = await receiveClientSubmissionService(currentUser, caseId, submissionId);
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
