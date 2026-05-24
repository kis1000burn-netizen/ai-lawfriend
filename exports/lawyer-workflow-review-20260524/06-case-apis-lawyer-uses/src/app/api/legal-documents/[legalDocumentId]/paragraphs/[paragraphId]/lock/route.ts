import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/errors";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ legalDocumentId: string; paragraphId: string }> },
) {
  try {
    const { legalDocumentId, paragraphId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError();
    }

    const body = await req.json().catch(() => ({}));
    const locked =
      typeof body?.locked === "boolean" ? body.locked : true;

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
    assertCaseAccess("paragraph.lock", permCtx);

    if (!["ADMIN", "LAWYER", "SUPER_ADMIN"].includes(sessionUser.role)) {
      throw new ForbiddenError("문단 잠금/해제는 관리자 또는 변호사만 가능합니다.");
    }

    if (!locked && paragraph.document.status === "LOCKED") {
      throw new ForbiddenError("잠긴 승인 문서의 문단은 해제할 수 없습니다.");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const nextParagraph = await tx.legalDocumentParagraph.update({
        where: { id: paragraph.id },
        data: locked
          ? {
              status: "LOCKED",
              lockedAt: new Date(),
              lockedById: sessionUser.id,
            }
          : {
              status: "DRAFT",
              lockedAt: null,
              lockedById: null,
            },
      });

      await tx.caseTimelineEvent.create({
        data: {
          caseId: paragraph.document.caseId,
          type: locked ? "PARAGRAPH_LOCKED" : "PARAGRAPH_UNLOCKED",
          title: locked ? `문단 잠금: ${paragraph.title}` : `문단 잠금 해제: ${paragraph.title}`,
          metaJson: {
            documentId: legalDocumentId,
            paragraphId,
            locked,
          },
          actorUserId: sessionUser.id,
        },
      });

      return nextParagraph;
    });

    return ok(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
