import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { canRegenerateParagraph } from "@/lib/definitions";
import {
  invokeDocumentParagraphRegenerate,
  mapLegalDocumentTypeToTemplateType,
  parseParagraphGenerationMode,
} from "@/features/ai-core";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";

const BodySchema = z.object({
  instruction: z.string().trim().optional().nullable(),
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
        histories: {
          orderBy: { versionNo: "desc" },
          take: 1,
        },
      },
    });

    if (!paragraph) {
      throw new NotFoundError("문단을 찾을 수 없습니다.");
    }

    const c = paragraph.document.case;
    const permCtx = await buildPermissionContextForCase(sessionUser, c);

    assertCaseAccess("paragraph.regenerate", permCtx);

    const allowed = canRegenerateParagraph({
      ...permCtx,
      isDocumentLocked: paragraph.document.status === "LOCKED",
      isApprovedVersion: paragraph.document.status === "APPROVED",
    });

    if (!allowed) {
      throw new ValidationError("현재 상태에서는 문단 재생성이 허용되지 않습니다.");
    }

    if (!paragraph.supportsRegeneration) {
      throw new ValidationError("이 문단은 재생성을 지원하지 않습니다.");
    }

    if (paragraph.document.status === "APPROVED") {
      throw new AppError("승인된 문서의 문단은 재생성할 수 없습니다.", 409, "CONFLICT");
    }

    if (paragraph.status === "LOCKED") {
      throw new AppError("잠금된 문단은 재생성할 수 없습니다.", 409, "CONFLICT");
    }

    const beforeContent = paragraph.content;
    const isApprovedLocked = false;

    const { content: afterContent } = await invokeDocumentParagraphRegenerate({
      documentTitle: paragraph.document.title,
      templateType: mapLegalDocumentTypeToTemplateType(paragraph.document.type),
      generationMode: parseParagraphGenerationMode(paragraph.generationMode),
      isApprovedLocked,
      templateAiPromptKey: paragraph.aiPromptKey,
      paragraph: {
        id: paragraph.id,
        title: paragraph.title,
        content: beforeContent,
        sectionKey: paragraph.sectionKey,
        paragraphKey: paragraph.paragraphKey,
      },
      instruction: body.instruction ?? undefined,
      auditContext: {
        actorUserId: sessionUser.id,
        caseId: paragraph.document.caseId,
        legalDocumentId,
        paragraphId,
        paragraphKey: paragraph.paragraphKey,
      },
    });

    const latestVersionNo = paragraph.histories[0]?.versionNo ?? 0;

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
          paragraphId: paragraph.id,
          versionNo: latestVersionNo + 1,
          action: "REGENERATE",
          beforeContent,
          afterContent,
          actorUserId: sessionUser.id,
          reason: body.reason ?? body.instruction ?? null,
        },
      });

      await tx.caseTimelineEvent.create({
        data: {
          caseId: paragraph.document.caseId,
          type: "PARAGRAPH_REGENERATED",
          title: `문단 재생성: ${paragraph.title}`,
          description: body.reason ?? body.instruction ?? null,
          metaJson: {
            documentId: legalDocumentId,
            paragraphId,
            paragraphKey: paragraph.paragraphKey,
            reason: body.reason ?? body.instruction ?? null,
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
