import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ legalDocumentId: string }> },
) {
  try {
    const { legalDocumentId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError();
    }

    const document = await prisma.legalDocument.findUnique({
      where: { id: legalDocumentId },
      include: {
        case: true,
      },
    });

    if (!document) {
      throw new NotFoundError("문서를 찾을 수 없습니다.");
    }

    const c = document.case;
    const permCtx = {
      ...(await buildPermissionContextForCase(sessionUser, c)),
      isDocumentLocked: document.status === "LOCKED",
    };
    assertCaseAccess("document.lock", permCtx);

    /** Batch A-3: UI `document-review-panel`과 동일 축 — ADMIN / LAWYER / SUPER_ADMIN */
    if (!["ADMIN", "LAWYER", "SUPER_ADMIN"].includes(sessionUser.role)) {
      throw new ForbiddenError("문서 잠금은 관리자 또는 변호사만 가능합니다.");
    }

    if (document.status !== "APPROVED") {
      throw new ValidationError("승인된 문서만 잠글 수 있습니다.");
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const nextDocument = await tx.legalDocument.update({
        where: { id: legalDocumentId },
        data: {
          status: "LOCKED",
          lockedAt: now,
          lockedById: sessionUser.id,
        },
      });

      await tx.legalDocumentParagraph.updateMany({
        where: {
          documentId: legalDocumentId,
          lockOnApproval: true,
        },
        data: {
          status: "LOCKED",
          lockedAt: now,
          lockedById: sessionUser.id,
        },
      });

      await tx.caseTimelineEvent.create({
        data: {
          caseId: document.caseId,
          type: "DOCUMENT_LOCKED",
          title: `문서 잠금: ${document.title}`,
          metaJson: { documentId: legalDocumentId },
          actorUserId: sessionUser.id,
        },
      });

      return nextDocument;
    });

    return ok(updated);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
