import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

const BodySchema = z.object({
  historyId: z.string().min(1),
  reason: z.string().trim().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ legalDocumentId: string; paragraphId: string }> },
) {
  try {
    const { legalDocumentId, paragraphId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError();
    }

    const body = BodySchema.parse(await req.json());

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
    assertCaseAccess("paragraph.restore", permCtx);

    if (!paragraph.supportsRestore) {
      throw new ValidationError("이 문단은 복원을 지원하지 않습니다.");
    }

    if (paragraph.document.status === "LOCKED") {
      throw new ForbiddenError("잠금된 문서의 문단은 복원할 수 없습니다.");
    }

    const history = await prisma.legalDocumentParagraphHistory.findFirst({
      where: {
        id: body.historyId,
        paragraphId,
      },
      orderBy: { versionNo: "desc" },
    });

    if (!history) {
      throw new NotFoundError("복원 대상 이력을 찾을 수 없습니다.");
    }

    const latestHistory = await prisma.legalDocumentParagraphHistory.findFirst({
      where: { paragraphId },
      orderBy: { versionNo: "desc" },
    });

    const beforeContent = paragraph.content;
    const afterContent = history.afterContent ?? history.beforeContent ?? "";

    const updated = await prisma.$transaction(async (tx) => {
      const nextParagraph = await tx.legalDocumentParagraph.update({
        where: { id: paragraph.id },
        data: {
          content: afterContent,
          status: "DRAFT",
        },
      });

      await tx.legalDocumentParagraphHistory.create({
        data: {
          paragraphId,
          versionNo: (latestHistory?.versionNo ?? 0) + 1,
          action: "RESTORE",
          beforeContent,
          afterContent,
          actorUserId: sessionUser.id,
          reason: body.reason ?? `history:${history.id}`,
        },
      });

      await tx.caseTimelineEvent.create({
        data: {
          caseId: paragraph.document.caseId,
          type: "PARAGRAPH_RESTORED",
          title: `문단 복원: ${paragraph.title}`,
          description: body.reason ?? null,
          metaJson: {
            documentId: legalDocumentId,
            paragraphId,
            historyId: history.id,
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
