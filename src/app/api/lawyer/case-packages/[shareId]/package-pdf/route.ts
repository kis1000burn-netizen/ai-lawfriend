import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";
import {
  findShareForPackagePdf,
  logCasePackageAccess,
} from "@/features/case-package/case-package-share.repository";
import { evaluateCasePackagePdfPermission } from "@/features/case-package/case-package-pdf-permission";
import { buildCasePackagePdfResponse } from "@/features/case-package/case-package-pdf-response";
import {
  buildCasePackagePdfInputFromShare,
  resolveVerifiedCasePackageSnapshot,
} from "@/features/case-package/case-package-share-snapshot-utils";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    shareId: string;
  }>;
};

function getRequestContext(request: Request, actorUserId: string) {
  return {
    actorUserId,
    ip: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  };
}

function isLawyerLikeRole(role: string): boolean {
  return role === "LAWYER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

function getDeniedAction(code: string): "DENIED" | "EXPIRED" | "REVOKED" {
  if (code === "SHARE_EXPIRED") {
    return "EXPIRED";
  }

  if (code === "SHARE_REVOKED") {
    return "REVOKED";
  }

  return "DENIED";
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  const { shareId } = await context.params;

  if (!user || !isLawyerLikeRole(user.role)) {
    return NextResponse.json(
      {
        ok: false,
        code: "LAWYER_AUTH_REQUIRED",
        message: "변호사 권한이 필요합니다.",
      },
      { status: 403 },
    );
  }

  if (user.role === "LAWYER") {
    await assertLawyerProfessionalAccess(user);
  }

  const share = await findShareForPackagePdf({
    shareId,
    actorUserId: user.id,
    actorMode: "LAWYER",
  });

  if (!share) {
    return NextResponse.json(
      {
        ok: false,
        code: "SHARE_NOT_FOUND",
        message: "사건 패키지 공유 정보를 찾을 수 없습니다.",
      },
      { status: 404 },
    );
  }

  const decision = evaluateCasePackagePdfPermission({
    status: share.status,
    expiresAt: share.expiresAt,
    revokedAt: share.revokedAt,
    allowPackagePdf: share.allowPackagePdf,
  });

  if (!decision.allowed) {
    await logCasePackageAccess({
      shareId: share.id,
      caseId: share.caseId,
      action: getDeniedAction(decision.code),
      targetType: "PACKAGE",
      targetId: share.id,
      resultMessage: decision.message,
      context: getRequestContext(request, user.id),
    });

    return NextResponse.json(
      {
        ok: false,
        code: decision.code,
        message: decision.message,
      },
      { status: 403 },
    );
  }

  await logCasePackageAccess({
    shareId: share.id,
    caseId: share.caseId,
    action: "DOWNLOAD",
    targetType: "PACKAGE",
    targetId: share.id,
    resultMessage: "사건 패키지 PDF 요약본 다운로드",
    context: getRequestContext(request, user.id),
  });

  const verifiedSnapshot = resolveVerifiedCasePackageSnapshot(
    share.snapshotJson,
    share.snapshotSha256,
  );

  const pdfInput = buildCasePackagePdfInputFromShare({
    share: {
      id: share.id,
      publicCode: share.publicCode,
      expiresAt: share.expiresAt,
      allowSummary: share.allowSummary,
      allowAttachmentList: share.allowAttachmentList,
      allowDocumentDraft: share.allowDocumentDraft,
      allowPackagePdf: share.allowPackagePdf,
    },
    verifiedSnapshot,
    liveCase: {
      ...share.case,
      attachments: share.case.attachments.map((a) => ({
        id: a.id,
        originalName: a.originalName,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        createdAt: a.createdAt,
      })),
      legalDocuments: share.case.legalDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    },
    owner: share.owner,
  });

  return buildCasePackagePdfResponse(pdfInput);
}
