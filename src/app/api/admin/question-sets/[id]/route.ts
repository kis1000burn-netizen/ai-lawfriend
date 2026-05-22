import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { fail, ok } from "@/lib/domain-api-response";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";
import {
  canManageQuestionSets,
  deleteQuestionSet,
  getQuestionSetById,
  updateQuestionSet,
} from "@/features/question-set/question-set.service";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("인증이 필요합니다.", 401);
    }
    if (!canManageQuestionSets(user.role)) {
      return fail("권한이 없습니다.", 403);
    }

    await assertLawyerProfessionalAccess(user);

    const { id } = await params;
    const questionSet = await getQuestionSetById(id);

    if (!questionSet) {
      return fail("질문셋을 찾을 수 없습니다.", 404);
    }

    return ok(questionSet);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, { code: error.code });
    }
    return fail(
      error instanceof Error ? error.message : "질문셋 조회 중 오류가 발생했습니다.",
      500,
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("인증이 필요합니다.", 401);
    }
    if (!canManageQuestionSets(user.role)) {
      return fail("권한이 없습니다.", 403);
    }

    await assertLawyerProfessionalAccess(user);

    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;

    const updated = await updateQuestionSet(id, {
      name: body.name as string | undefined,
      code: (body.code as string | null) ?? undefined,
      description: (body.description as string | null) ?? undefined,
      isActive: body.isActive as boolean | undefined,
      questions: body.questions as import("@/features/question-set/question-set.types").QuestionSetQuestion[] | undefined,
    });

    return ok(updated);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, { code: error.code });
    }
    return fail(
      error instanceof Error ? error.message : "질문셋 저장 중 오류가 발생했습니다.",
      400,
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("인증이 필요합니다.", 401);
    }
    if (!canManageQuestionSets(user.role)) {
      return fail("권한이 없습니다.", 403);
    }

    await assertLawyerProfessionalAccess(user);

    const { id } = await params;
    await deleteQuestionSet(id);

    return ok({});
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, { code: error.code });
    }
    return fail(error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.", 400);
  }
}
