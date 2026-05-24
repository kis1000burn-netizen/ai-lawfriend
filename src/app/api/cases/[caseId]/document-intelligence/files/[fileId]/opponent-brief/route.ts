import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { litigationFileParamsSchema } from "@/features/document-intelligence/document-upload.schema";
import { getLitigationOpponentBriefAnalysisService } from "@/features/document-intelligence/opponent-brief-analysis.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string; fileId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, fileId } = litigationFileParamsSchema.parse(params);

    const result = await getLitigationOpponentBriefAnalysisService(
      currentUser,
      caseId,
      fileId,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
