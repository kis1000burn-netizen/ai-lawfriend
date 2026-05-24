import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { sendKakaoDocumentNoticeService } from "@/features/secure-document-delivery/secure-document-delivery.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string; shareId: string }> };

const shareIdParamSchema = z.object({
  caseId: caseIdParamSchema.shape.caseId,
  shareId: z.string().cuid(),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = shareIdParamSchema.parse(await context.params);
    const body = await request.json().catch(() => ({}));
    const result = await sendKakaoDocumentNoticeService(
      currentUser,
      params.caseId,
      params.shareId,
      body,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
