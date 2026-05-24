import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { rejectDocumentIntelligenceReviewItemService } from "@/features/document-intelligence/document-intelligence-review.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = caseIdParamSchema.extend({
  itemId: z.string().min(1),
});

type RouteContext = {
  params: Promise<{ caseId: string; itemId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, itemId } = paramsSchema.parse(params);
    const body = await request.json();

    const result = await rejectDocumentIntelligenceReviewItemService(
      currentUser,
      caseId,
      itemId,
      body,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
