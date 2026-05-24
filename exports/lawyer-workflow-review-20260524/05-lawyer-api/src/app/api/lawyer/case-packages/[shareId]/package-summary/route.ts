import { z } from "zod";
import { toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { assertCanDownloadPackageSummary } from "@/lib/case-package/case-package-pdf-policy";
import { createCasePackageAccessLog } from "@/lib/case-package/case-package-access-log";
import { renderCasePackageSummaryHtml } from "@/lib/case-package/case-package-summary-renderer";
import { resolveVerifiedCasePackageSnapshot } from "@/features/case-package/case-package-share-snapshot-utils";
import { normalizeShareStatusByTime } from "@/lib/case-package/case-package-share-policy";

export const dynamic = "force-dynamic";

const routeParamsSchema = z.object({
  shareId: z.string().trim().min(1),
});

type RouteContext = {
  params: Promise<{
    shareId: string;
  }>;
};

function buildHtmlFileName(publicCode: string): string {
  const safeCode = publicCode.replace(/[^A-Z0-9-]/gi, "_");
  return `ai-lawfriend-case-package-${safeCode}.html`;
}

function buildContentDisposition(fileName: string) {
  const encoded = encodeURIComponent(fileName);
  return `attachment; filename*=UTF-8''${encoded}`;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { shareId } = routeParamsSchema.parse(params);

    const share = await prisma.casePackageShare.findUnique({
      where: { id: shareId },
      include: {
        case: {
          include: {
            attachments: {
              where: { status: "ACTIVE" },
              orderBy: { createdAt: "desc" },
            },
            legalDocuments: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!share) {
      throw new NotFoundError("사건 패키지 공유를 찾을 수 없습니다.");
    }

    try {
      if (currentUser.role === "LAWYER") {
        await assertLawyerProfessionalAccess(currentUser);
      }

      assertCanDownloadPackageSummary({
        currentUser,
        share,
      });
    } catch (error) {
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
        targetType: "PACKAGE_SUMMARY",
        targetId: share.id,
        resultMessage:
          error instanceof Error
            ? error.message
            : "사건 패키지 요약본 출력이 거부되었습니다.",
        request,
      });

      throw error;
    }

    const verifiedSnapshot = resolveVerifiedCasePackageSnapshot(
      share.snapshotJson,
      share.snapshotSha256,
    );
    const html = renderCasePackageSummaryHtml(share, {
      verifiedSnapshot,
    });

    await createCasePackageAccessLog({
      shareId: share.id,
      caseId: share.caseId,
      actorUserId: currentUser.id,
      action: "DOWNLOAD",
      targetType: "PACKAGE_SUMMARY",
      targetId: share.id,
      resultMessage: "사건 패키지 요약본 출력",
      request,
    });

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": buildContentDisposition(
          buildHtmlFileName(share.publicCode),
        ),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}