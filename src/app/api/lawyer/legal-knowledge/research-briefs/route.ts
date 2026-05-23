import { NextRequest } from "next/server";
import { requireApprovedLawyerApi } from "@/lib/auth/require-approved-lawyer-api";
import { ok, toErrorResponse, fail } from "@/lib/domain-api-response";
import { listLegalKnowledgeBriefsForLawyerReview } from "@/features/gongbuho/legal-knowledge-pipeline.service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    await requireApprovedLawyerApi();
    const items = await listLegalKnowledgeBriefsForLawyerReview();
    return ok({ items });
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
