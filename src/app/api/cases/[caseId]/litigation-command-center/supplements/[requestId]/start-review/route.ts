import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { startCommandCenterSupplementReviewService } from "@/features/document-intelligence/litigation-command-center-actions.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = caseIdParamSchema.extend({
  requestId: z.string().cuid(),
});

type RouteContext = {
  params: Promise<{ caseId: string; requestId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, requestId } = paramsSchema.parse(params);

    const result = await startCommandCenterSupplementReviewService(
      currentUser,
      caseId,
      requestId,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
