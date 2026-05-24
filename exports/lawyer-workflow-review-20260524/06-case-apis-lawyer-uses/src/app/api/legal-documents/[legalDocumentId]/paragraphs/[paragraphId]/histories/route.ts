import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ legalDocumentId: string; paragraphId: string }> },
) {
  try {
    const { legalDocumentId, paragraphId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError();
    }

    const paragraph = await prisma.legalDocumentParagraph.findFirst({
      where: {
        id: paragraphId,
        documentId: legalDocumentId,
      },
      include: {
        document: {
          include: {
            case: true,
          },
        },
      },
    });

    if (!paragraph) {
      throw new NotFoundError("문단을 찾을 수 없습니다.");
    }

    const c = paragraph.document.case;
    const permCtx = await buildPermissionContextForCase(sessionUser, c);
    assertCaseAccess("paragraph.read", permCtx);

    const histories = await prisma.legalDocumentParagraphHistory.findMany({
      where: { paragraphId },
      orderBy: { versionNo: "desc" },
    });

    return ok(
      histories.map((item) => ({
        id: item.id,
        versionNo: item.versionNo,
        action: item.action,
        beforeContent: item.beforeContent,
        afterContent: item.afterContent,
        actorUserId: item.actorUserId,
        reason: item.reason,
        createdAt: item.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
