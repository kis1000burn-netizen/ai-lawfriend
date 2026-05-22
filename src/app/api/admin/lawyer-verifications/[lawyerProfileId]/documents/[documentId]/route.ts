import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { fail } from "@/lib/domain-api-response";
import { writeAuditLog } from "@/lib/audit-log";
import {
  createLawyerVerificationAdminSignedRedirectUrl,
  getLawyerVerificationSignedUrlTtlSeconds,
} from "@/lib/lawyer/lawyer-verification-signed-get";
import {
  buildLawyerVerificationDocumentAccessAuditMetadata,
  legacyLawyerVerificationUrlHostForAudit,
} from "@/lib/lawyer/lawyer-verification-document-access-audit";
import { isHttpLegacyLawyerVerificationFileUrl } from "@/lib/lawyer/lawyer-verification-legacy-policy";

export const dynamic = "force-dynamic";

/**
 * 관리자 전용 증빙 열람: 권한 확인 후 감사로그를 남기고
 * - `storageKey` → 짧은 만료 presigned / signed URL 또는 로컬용 content-token 리다이렉트(우선)
 * - legacy http(s) `fileUrl` 만 있는 경우 → 외부 URL 리다이렉트(P4 이관 권장)
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ lawyerProfileId: string; documentId: string }> },
) {
  try {
    const admin = await requireStaffOrPlatformAdminApi();
    const { lawyerProfileId, documentId } = await context.params;

    const doc = await prisma.lawyerVerificationDocument.findFirst({
      where: {
        id: documentId,
        lawyerProfileId,
        lawyerProfile: { user: { role: "LAWYER" } },
      },
      select: {
        id: true,
        fileUrl: true,
        storageKey: true,
        bucket: true,
        fileName: true,
        type: true,
      },
    });

    if (!doc) {
      return fail("문서를 찾을 수 없습니다.", 404, { code: "NOT_FOUND" });
    }

    const sk = doc.storageKey?.trim();
    if (sk) {
      const ttl = getLawyerVerificationSignedUrlTtlSeconds();
      const origin = new URL(req.url).origin;
      let target: string;
      let accessMode: "signed_redirect" | "local_content_token";
      try {
        ({ url: target, accessMode } = await createLawyerVerificationAdminSignedRedirectUrl({
          storageKey: sk,
          bucket: doc.bucket ?? null,
          lawyerProfileId,
          documentId: doc.id,
          requestOrigin: origin,
        }));
      } catch (e) {
        console.error("[LAWYER_VERIFICATION_SIGNED_REDIRECT]", e);
        return fail("증빙 파일 링크를 생성할 수 없습니다. 스토리지 설정을 확인해 주세요.", 502, {
          code: "SIGNED_URL_FAILED",
        });
      }

      await writeAuditLog({
        actorUserId: admin.id,
        action: "LAWYER_VERIFICATION_DOCUMENT_ACCESS",
        entityType: "LAWYER_VERIFICATION_DOCUMENT",
        entityId: doc.id,
        message: `변호사 증빙 열람(${accessMode}): profile=${lawyerProfileId} file=${doc.fileName} ttlSec=${ttl}`,
        metadata: buildLawyerVerificationDocumentAccessAuditMetadata({
          lawyerProfileId,
          documentId: doc.id,
          verificationDocumentType: doc.type,
          accessMode,
          hasStorageKey: true,
          signedUrlTtlSec: ttl,
        }),
      });

      return NextResponse.redirect(target);
    }

    const rawUrl = doc.fileUrl?.trim();
    if (rawUrl && isHttpLegacyLawyerVerificationFileUrl(rawUrl)) {
      const target = rawUrl;

      await writeAuditLog({
        actorUserId: admin.id,
        action: "LAWYER_VERIFICATION_DOCUMENT_ACCESS",
        entityType: "LAWYER_VERIFICATION_DOCUMENT",
        entityId: doc.id,
        message: `변호사 증빙 열람(legacy_access): profile=${lawyerProfileId} file=${doc.fileName}`,
        metadata: buildLawyerVerificationDocumentAccessAuditMetadata({
          lawyerProfileId,
          documentId: doc.id,
          verificationDocumentType: doc.type,
          accessMode: "legacy_access",
          hasStorageKey: false,
          legacyUrlHost: legacyLawyerVerificationUrlHostForAudit(rawUrl),
        }),
      });

      return NextResponse.redirect(target);
    }

    return fail("허용되지 않은 파일 주소입니다.", 400, { code: "VALIDATION_ERROR" });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return fail(err.message ?? "열람 처리 실패", err.status ?? 500, {
      code:
        err.status === 401
          ? "UNAUTHORIZED"
          : err.status === 403
            ? "FORBIDDEN"
            : "INTERNAL_ERROR",
    });
  }
}
