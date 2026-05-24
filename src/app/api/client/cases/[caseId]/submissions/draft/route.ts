import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import {
  saveClientSubmissionDraftService,
  submitFreeUploadService,
} from "@/features/client-portal/client-submission.service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = caseIdParamSchema.parse(await context.params);
    const body = await request.json();
    const result = await saveClientSubmissionDraftService(currentUser, caseId, body);
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
