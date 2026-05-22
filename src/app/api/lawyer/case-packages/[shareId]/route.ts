import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";
import {
  findShareForLawyer,
  logCasePackageAccess,
  resolveShareStatusForResponse,
} from "@/features/case-package/case-package-share.repository";
import {
  buildLawyerCasePackageApiPayload,
  resolveVerifiedCasePackageSnapshot,
} from "@/features/case-package/case-package-share-snapshot-utils";

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

export async function GET(request: Request, context: RouteContext) {
  const user = await requireSessionUser();
  const { shareId } = await context.params;

  if (
    user.role !== "LAWYER" &&
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN"
  ) {
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

  const share = await findShareForLawyer({
    shareId,
    lawyerUserId: user.id,
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

  const resolvedStatus = resolveShareStatusForResponse({
    status: share.status,
    expiresAt: share.expiresAt,
    revokedAt: share.revokedAt,
  });

  if (resolvedStatus !== "ACTIVE") {
    await logCasePackageAccess({
      shareId: share.id,
      caseId: share.caseId,
      action: resolvedStatus === "EXPIRED" ? "EXPIRED" : "REVOKED",
      targetType: "PACKAGE",
      resultMessage: `공유 상태: ${resolvedStatus}`,
      context: getRequestContext(request, user.id),
    });

    return NextResponse.json(
      {
        ok: false,
        code: resolvedStatus === "EXPIRED" ? "SHARE_EXPIRED" : "SHARE_REVOKED",
        message:
          resolvedStatus === "EXPIRED"
            ? "사건 패키지 공유 기간이 만료되었습니다."
            : "사건 패키지 공유가 취소되었습니다.",
      },
      { status: 403 },
    );
  }

  await logCasePackageAccess({
    shareId: share.id,
    caseId: share.caseId,
    action: "VIEW",
    targetType: "PACKAGE",
    resultMessage: "사건 패키지 상세 열람",
    context: getRequestContext(request, user.id),
  });

  const verifiedSnapshot = resolveVerifiedCasePackageSnapshot(
    share.snapshotJson,
    share.snapshotSha256,
  );

  const payload = buildLawyerCasePackageApiPayload({
    share,
    owner: share.owner,
    verifiedSnapshot,
    liveCase: {
      id: share.case.id,
      title: share.case.title,
      status: share.case.status,
      category: share.case.category,
      description: share.case.description,
      createdAt: share.case.createdAt,
      updatedAt: share.case.updatedAt,
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
  });

  return NextResponse.json({
    ok: true,
    ...payload,
  });
}
