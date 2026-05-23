import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { canApproveDocument } from "@/lib/definitions";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { assertVoiceDocumentFinalizeAllowed } from "@/lib/voice/voice-document-finalize-gate.service";
import type { CaseStatus as PrismaCaseStatus } from "@prisma/client";

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
        paragraphs: true,
        versions: {
          orderBy: { versionNo: "desc" },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new NotFoundError("문서를 찾을 수 없습니다.");
    }

    const trace = await prisma.documentGenerationTrace.findUnique({
      where: { legalDocumentId },
      select: { id: true },
    });

    if (!trace) {
      throw new ValidationError(
        "문서 승인 전 출처 추적 정보가 없습니다. 문서를 다시 생성하거나 관리자에게 문의하세요.",
      );
    }

    /** Batch A-3: 승인 가능 상태만 허용 (`LegalDocumentStatus` 기준) */
    const APPROVABLE_STATUSES = ["DRAFT", "REVIEW_REQUIRED"] as const;
    if (document.status === "ARCHIVED") {
      throw new ForbiddenError("보관(ARCHIVED)된 문서는 승인할 수 없습니다.");
    }
    if (document.status === "APPROVED" || document.status === "LOCKED") {
      throw new ForbiddenError("이미 승인되었거나 잠금된 문서는 다시 승인할 수 없습니다.");
    }
    if (
      !(APPROVABLE_STATUSES as readonly string[]).includes(document.status)
    ) {
      throw new ValidationError(
        `현재 문서 상태(${document.status})에서는 승인할 수 없습니다.`,
      );
    }

    const c = document.case;
    const prevCaseStatus = c.status;
    const permCtx = {
      ...(await buildPermissionContextForCase(sessionUser, c)),
      isDocumentLocked: false,
    };

    assertCaseAccess("document.approve", permCtx);

    const allowed = canApproveDocument({
      ...permCtx,
    });

    if (!allowed) {
      throw new ForbiddenError("문서 승인 권한이 없습니다.");
    }

    await assertVoiceDocumentFinalizeAllowed(document.caseId);

    const snapshotParagraphs = document.paragraphs.map((p) => ({
      id: p.id,
      sectionKey: p.sectionKey,
      paragraphKey: p.paragraphKey,
      title: p.title,
      displayOrder: p.displayOrder,
      content: p.content,
      status: p.status,
    }));

    const nextVersionNo = (document.versions[0]?.versionNo ?? 0) + 1;
    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const approvedDocument = await tx.legalDocument.update({
        where: { id: legalDocumentId },
        data: {
          status: "APPROVED",
          latestApprovedAt: now,
          latestApprovedById: sessionUser.id,
          body: snapshotParagraphs
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((p) => p.content)
            .join("\n\n"),
        },
      });

      await tx.documentGenerationTrace.update({
        where: { legalDocumentId },
        data: {
          approvedSnapshotAt: now,
        },
      });

      await tx.legalDocumentParagraph.updateMany({
        where: {
          documentId: legalDocumentId,
          lockOnApproval: true,
        },
        data: {
          status: "APPROVED",
        },
      });

      await tx.legalDocumentVersion.create({
        data: {
          documentId: legalDocumentId,
          versionNo: nextVersionNo,
          snapshotJson: {
            approvedAt: now.toISOString(),
            approvedById: sessionUser.id,
            paragraphs: snapshotParagraphs,
          },
          approved: true,
          approvedAt: now,
          approvedById: sessionUser.id,
        },
      });

      /** 사건 상태를 APPROVED로 맞추어 이후 DELIVER_DOCUMENT 전이와 정합한다(문서 승인 = 사건 승인 단계). */
      await tx.case.update({
        where: { id: document.caseId },
        data: {
          status: "APPROVED" as PrismaCaseStatus,
        },
      });

      if (prevCaseStatus !== "APPROVED") {
        await tx.caseTimelineEvent.create({
          data: {
            caseId: document.caseId,
            type: "CASE_STATUS_CHANGED",
            title: `사건 상태 변경: ${prevCaseStatus} → APPROVED`,
            description: null,
            metaJson: {
              from: prevCaseStatus,
              to: "APPROVED",
              reason: null,
              source: "document_approve",
              legalDocumentId,
            },
            actorUserId: sessionUser.id,
          },
        });
      }

      await tx.caseTimelineEvent.create({
        data: {
          caseId: document.caseId,
          type: "DOCUMENT_APPROVED",
          title: `문서 승인: ${document.title}`,
          metaJson: {
            documentId: legalDocumentId,
            versionNo: nextVersionNo,
            approvedAt: now.toISOString(),
            approvedById: sessionUser.id,
          },
          actorUserId: sessionUser.id,
        },
      });

      return approvedDocument;
    });

    return ok(updated);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
