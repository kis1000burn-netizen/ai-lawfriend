import { z } from "zod";
import { requireLegalKnowledgeLawyerReviewApi } from "@/lib/auth/require-legal-knowledge-lawyer-review-api";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { recordLegalKnowledgeLawyerReviewBodySchema } from "@/lib/validators/legal-knowledge-pipeline";
import { recordLegalKnowledgeLawyerReview } from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { writeGongbuhoAuditLog } from "@/lib/gongbuho/gongbuho-audit-log";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ briefId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { user, reviewerRole } = await requireLegalKnowledgeLawyerReviewApi();
    const { briefId } = await params;
    const body = recordLegalKnowledgeLawyerReviewBodySchema.parse(
      await req.json(),
    );
    const review = await recordLegalKnowledgeLawyerReview({
      briefId,
      reviewer: user,
      reviewerRole,
      body,
    });
    await writeGongbuhoAuditLog({
      actorUserId: user.id,
      event: "GONGBUHO_LEGAL_KNOWLEDGE_LAWYER_REVIEW_RECORDED",
      entityType: "LEGAL_KNOWLEDGE_LAWYER_REVIEW",
      entityId: review.id,
      metadata: {
        briefId,
        intakeId: review.intakeId,
        decision: review.decision,
        reviewerRole,
      },
    });
    return ok({ review }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return fail("Lawyer Review 요청 형식이 올바르지 않습니다.", 400, {
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      });
    }
    const err = error as Error & { status?: number };
    if (err.status === 401 || err.status === 403) {
      return fail(err.message, err.status, {
        code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}
