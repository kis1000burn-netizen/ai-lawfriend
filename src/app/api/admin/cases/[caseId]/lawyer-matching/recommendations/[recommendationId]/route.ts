import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { ValidationError } from "@/lib/errors";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import {
  approveCaseLawyerMatchingRecommendationService,
  getCaseLawyerMatchingRecommendationForAdminService,
  rejectCaseLawyerMatchingRecommendationService,
} from "@/features/case-assignments/case-lawyer-matching-recommendation.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string; recommendationId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const result = await getCaseLawyerMatchingRecommendationForAdminService(
      currentUser,
      caseId,
      params.recommendationId,
    );

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);
    const body = (await request.json()) as {
      action?: "approve" | "reject";
      assigneeUserId?: string;
      note?: string;
    };

    if (body.action === "approve") {
      if (!body.assigneeUserId) {
        return toErrorResponse(new ValidationError("assigneeUserId가 필요합니다."));
      }

      const result = await approveCaseLawyerMatchingRecommendationService(
        currentUser,
        caseId,
        {
          recommendationId: params.recommendationId,
          assigneeUserId: body.assigneeUserId,
          note: body.note,
        },
      );
      return ok(result);
    }

    if (body.action === "reject") {
      const result = await rejectCaseLawyerMatchingRecommendationService(
        currentUser,
        caseId,
        params.recommendationId,
        body.note,
      );
      return ok(result);
    }

    return toErrorResponse(new ValidationError("action은 approve 또는 reject여야 합니다."));
  } catch (error) {
    return toErrorResponse(error);
  }
}
