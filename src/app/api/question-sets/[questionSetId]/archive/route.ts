import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";

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
      "questionSet.archive",
      permissionContextFromSession(sessionUser, {}),
    );

    await assertLawyerProfessionalAccess(sessionUser);

    const questionSet = await prisma.questionSet.findUnique({
      where: { id: questionSetId },
    });

    if (!questionSet) {
      return Response.json({ ok: false, message: "질문셋을 찾을 수 없습니다." }, { status: 404 });
    }

    const updated = await prisma.questionSet.update({
      where: { id: questionSetId },
      data: {
        catalogStatus: "ARCHIVED",
        archivedAt: new Date(),
      },
    });

    return ok(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
