import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";
import { buildValidatedAQuestionsForQuestionSet } from "@/features/question-set/apply-definition-to-questions";

/**
 * B §4.1(α) · §4.2 온라인 동기: `PATCH` 한 요청의 트랜잭션 안에서 게시(재게시)와 함께
 * `definitionJson` → A안 `questions` 투영(공유 (β) `buildValidatedAQuestionsForQuestionSet`).
 * 질문셋 저장 `PATCH`는 `definitionJson`만 갱신(B §2 비채택 (가)) — 본 경로가 런타임 A안 반영의 기본 시점.
 * @see `docs/project-governance/EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md` §4.1~4.2
 * @see `IMPLEMENTATION_EVIDENCE` [349] `EVIDENCE-20260425-349`
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ questionSetId: string }> },
) {
  try {
    const { questionSetId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission(
      "questionSet.publish",
      permissionContextFromSession(sessionUser, {}),
    );

    await assertLawyerProfessionalAccess(sessionUser);

    const questionSet = await prisma.questionSet.findUnique({
      where: { id: questionSetId },
    });

    if (!questionSet) {
      return Response.json({ ok: false, message: "질문셋을 찾을 수 없습니다." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.questionSet.findUniqueOrThrow({
        where: { id: questionSetId },
      });
      const projected = buildValidatedAQuestionsForQuestionSet(current.definitionJson, {
        id: current.id,
        name: current.name,
        code: current.code,
        description: current.description,
        isActive: current.isActive,
      });
      const questionsJson = projected as unknown as Prisma.InputJsonValue;
      return tx.questionSet.update({
        where: { id: questionSetId },
        data: {
          catalogStatus: "PUBLISHED",
          publishedAt: new Date(),
          archivedAt: null,
          questions: questionsJson,
        },
      });
    });

    return ok(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
