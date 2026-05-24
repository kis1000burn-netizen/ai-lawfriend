import { toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { casePackageAttachmentDownloadRouteParamsSchema } from "@/lib/case-package/case-package-share-schema";
import { assertCanDownloadSharedAttachment } from "@/lib/case-package/case-package-download-policy";
import { createCasePackageAccessLog } from "@/lib/case-package/case-package-access-log";
import { normalizeShareStatusByTime } from "@/lib/case-package/case-package-share-policy";
import { createAttachmentDownloadResponse } from "@/lib/case-package/shared-attachment-file";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    shareId: string;
    attachmentId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { shareId, attachmentId } =
      casePackageAttachmentDownloadRouteParamsSchema.parse(params);

    const share = await prisma.casePackageShare.findUnique({
      where: { id: shareId },
      select: {
        id: true,
        caseId: true,
        ownerUserId: true,
        lawyerUserId: true,
        status: true,
        expiresAt: true,
        revokedAt: true,
        allowAttachmentList: true,
        allowAttachmentDownload: true,
      },
    });

    const attachment = await prisma.caseAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        caseId: true,
        status: true,
        storagePath: true,
        originalName: true,
        mimeType: true,
      },
    });

    try {
      if (!share) {
        throw new NotFoundError("사건 패키지 공유를 찾을 수 없습니다.");
      }

      if (currentUser.role === "LAWYER") {
        await assertLawyerProfessionalAccess(currentUser);
      }

      assertCanDownloadSharedAttachment({
        currentUser,
        share,
        attachment,
      });
    } catch (error) {
      if (share) {
        const effectiveStatus = normalizeShareStatusByTime(
          share.status,
          share.expiresAt,
        );

        await createCasePackageAccessLog({
          shareId: share.id,
          caseId: share.caseId,
          actorUserId: currentUser.id,
          action:
            effectiveStatus === "EXPIRED"
              ? "EXPIRED"
              : effectiveStatus === "REVOKED"
                ? "REVOKED"
                : "DENIED",
          targetType: "ATTACHMENT",
          targetId: attachmentId,
          resultMessage:
            error instanceof Error
              ? error.message
              : "첨부파일 다운로드가 거부되었습니다.",
          request,
        });
      }

      throw error;
    }

    if (!attachment) {
      throw new NotFoundError("첨부파일 다운로드 정보를 확인할 수 없습니다.");
    }

    await createCasePackageAccessLog({
      shareId: share.id,
      caseId: share.caseId,
      actorUserId: currentUser.id,
      action: "DOWNLOAD",
      targetType: "ATTACHMENT",
      targetId: attachment.id,
      resultMessage: "공유 사건 패키지 첨부파일 다운로드",
      request,
    });

    return createAttachmentDownloadResponse({
      storagePath: attachment.storagePath,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}