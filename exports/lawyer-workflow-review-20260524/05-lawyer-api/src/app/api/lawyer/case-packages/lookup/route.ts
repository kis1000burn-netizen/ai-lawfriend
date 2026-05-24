import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { assertLawyerProfessionalAccess } from "@/lib/lawyer/lawyer-verification-access";
import { toErrorResponse } from "@/lib/domain-api-response";
import {
  findShareByPublicCode,
  logCasePackageAccess,
  resolveShareStatusForResponse,
} from "@/features/case-package/case-package-share.repository";
import {
  evaluateCasePackageAccess,
  verifyOptionalPin,
} from "@/features/case-package/case-package-share-policy-utils";
import { resolveVerifiedCasePackageSnapshot } from "@/features/case-package/case-package-share-snapshot-utils";

const lookupSchema = z.object({
  publicCode: z.string().min(1),
  pin: z.string().nullable().optional(),
});

function getRequestContext(request: Request, actorUserId: string) {
  return {
    actorUserId,
    ip: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    if (user.role === "LAWYER") {
      await assertLawyerProfessionalAccess(user);
    }
    const body: unknown = await request.json();
    const parsed = lookupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_LOOKUP_PAYLOAD",
          message: "고유번호 조회 입력값이 올바르지 않습니다.",
          issues: parsed.error.flatten(),
        },
        { status: 422 },
      );
    }

    const share = await findShareByPublicCode(parsed.data.publicCode.trim());

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

    const pinRequired = Boolean(share.optionalPinHash);
    const pinValid = pinRequired
      ? verifyOptionalPin({
          pin: parsed.data.pin ?? "",
          pinHash: share.optionalPinHash ?? "",
        })
      : true;

    const decision = evaluateCasePackageAccess({
      publicCode: share.publicCode,
      shareExists: true,
      status: resolveShareStatusForResponse({
        status: share.status,
        expiresAt: share.expiresAt,
        revokedAt: share.revokedAt,
      }),
      expiresAt: share.expiresAt,
      revokedAt: share.revokedAt,
      isLawyerAuthenticated:
        user.role === "LAWYER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN",
      lawyerMatchesShare: !share.lawyerUserId || share.lawyerUserId === user.id,
      pinRequired,
      pinValid,
    });

    let deniedAction: "DENIED" | "EXPIRED" | "REVOKED" = "DENIED";
    if (decision.code === "SHARE_EXPIRED") {
      deniedAction = "EXPIRED";
    } else if (decision.code === "SHARE_REVOKED") {
      deniedAction = "REVOKED";
    }

    if (!decision.allowed) {
      await logCasePackageAccess({
        shareId: share.id,
        caseId: share.caseId,
        action: deniedAction,
        targetType: "PACKAGE",
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
      action: "VIEW",
      targetType: "PACKAGE",
      resultMessage: "고유번호 조회 성공",
      context: getRequestContext(request, user.id),
    });

    const verifiedSnapshot = resolveVerifiedCasePackageSnapshot(
      share.snapshotJson,
      share.snapshotSha256,
    );

    return NextResponse.json({
      ok: true,
      share: {
        id: share.id,
        caseId: share.caseId,
        publicCode: share.publicCode,
        status: share.status,
        allowSummary: share.allowSummary,
        allowInterview: share.allowInterview,
        allowAttachmentList: share.allowAttachmentList,
        allowAttachmentDownload: share.allowAttachmentDownload,
        allowDocumentDraft: share.allowDocumentDraft,
        allowPackagePdf: share.allowPackagePdf,
        expiresAt: share.expiresAt,
        snapshotCaptured: Boolean(verifiedSnapshot),
        case: {
          id: share.case.id,
          title: verifiedSnapshot?.caseInfo.title ?? share.case.title,
          status: verifiedSnapshot?.caseInfo.status ?? share.case.status,
          caseType: verifiedSnapshot?.caseInfo.caseType ?? share.case.category,
          summary:
            share.allowSummary
              ? (verifiedSnapshot?.summary.shortSummary ?? share.case.description)
              : null,
          createdAt: share.case.createdAt,
          updatedAt: share.case.updatedAt,
        },
        owner: {
          id: share.owner.id,
          name: share.owner.name,
        },
      },
    });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}