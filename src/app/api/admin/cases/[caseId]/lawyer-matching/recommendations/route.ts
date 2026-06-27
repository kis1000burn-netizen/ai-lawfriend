import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { generateCaseLawyerMatchingRecommendationService } from "@/features/case-assignments/case-lawyer-matching-recommendation.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = caseIdParamSchema.parse(await context.params);
    const body = (await request.json()) as {
      category?: string | null;
      mappedCaseType?: string | null;
      gongbuhoCode?: string | null;
      conflictLawyerIds?: string[];
      candidates?: Array<{
        lawyerId: string;
        userStatus: "ACTIVE" | "PENDING" | "SUSPENDED" | "DELETED";
        verificationStatus:
          | "NOT_SUBMITTED"
          | "PENDING"
          | "APPROVED"
          | "REJECTED"
          | null;
        specialtiesNote?: string | null;
        activeAssignmentCount?: number;
      }>;
    };

    const result = await generateCaseLawyerMatchingRecommendationService(currentUser, {
      caseId,
      category: body.category,
      mappedCaseType: body.mappedCaseType,
      gongbuhoCode: body.gongbuhoCode,
      conflictLawyerIds: body.conflictLawyerIds,
      candidates: (body.candidates ?? []).map((candidate) => ({
        lawyerId: candidate.lawyerId,
        userStatus: candidate.userStatus,
        verificationStatus: candidate.verificationStatus,
        specialtiesNote: candidate.specialtiesNote ?? null,
        activeAssignmentCount: candidate.activeAssignmentCount ?? 0,
      })),
    });

    return ok(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
