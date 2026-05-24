import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { generateCommandCenterDraftFromContextService } from "@/features/document-intelligence/litigation-command-center-actions.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = caseIdParamSchema.extend({
  draftContextId: z.string().cuid(),
});

type RouteContext = {
  params: Promise<{ caseId: string; draftContextId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, draftContextId } = paramsSchema.parse(params);

    const result = await generateCommandCenterDraftFromContextService(
      currentUser,
      caseId,
      draftContextId,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
