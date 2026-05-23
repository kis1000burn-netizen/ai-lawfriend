import { requireApprovedLawyerApi } from "@/lib/auth/require-approved-lawyer-api";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { getLegalKnowledgeBriefForLawyerReview } from "@/features/gongbuho/legal-knowledge-pipeline.service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ briefId: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireApprovedLawyerApi();
    const { briefId } = await params;
    const brief = await getLegalKnowledgeBriefForLawyerReview(briefId);
    return ok({ brief });
  } catch (error: unknown) {
    const err = error as Error & { status?: number; statusCode?: number };
    const status = err.status ?? err.statusCode;
    if (status === 401 || status === 403) {
      return fail(err.message, status, {
        code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}
