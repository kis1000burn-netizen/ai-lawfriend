import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/domain-api-response";
import { verifyLawyerVerificationContentToken } from "@/lib/lawyer/lawyer-verification-content-token";
import { getIllegalLendingStorage } from "@/features/illegal-lending/storage/illegal-lending-storage";

export const dynamic = "force-dynamic";

/**
 * 로컬 스토리지 등: 관리자 메인 열람 라우트가 남기는 **단기 HMAC 토큰**으로만 접근.
 * (클라우드는 provider presigned URL 로 직접 리다이렉트)
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ lawyerProfileId: string; documentId: string }> },
) {
  try {
    const { lawyerProfileId, documentId } = await context.params;
    const url = new URL(req.url);
    const t = url.searchParams.get("t");
    const sig = url.searchParams.get("sig");
    const exp = t ? parseInt(t, 10) : NaN;
    if (!sig || !Number.isFinite(exp)) {
      return fail("접근 파라미터가 올바르지 않습니다.", 400, { code: "VALIDATION_ERROR" });
    }

    if (
      !verifyLawyerVerificationContentToken({
        exp,
        sig,
        lawyerProfileId,
        documentId,
      })
    ) {
      return fail("만료되었거나 올바르지 않은 링크입니다.", 403, { code: "FORBIDDEN" });
    }

    const doc = await prisma.lawyerVerificationDocument.findFirst({
      where: {
        id: documentId,
        lawyerProfileId,
        lawyerProfile: { user: { role: "LAWYER" } },
        storageKey: { not: null },
      },
      select: { storageKey: true, mimeType: true, fileName: true },
    });

    const key = doc?.storageKey?.trim();
    if (!doc || !key) {
      return fail("문서를 찾을 수 없습니다.", 404, { code: "NOT_FOUND" });
    }

    let body: Buffer;
    let contentType: string;
    try {
      const storage = getIllegalLendingStorage();
      const obj = await storage.get(key);
      body = obj.body;
      contentType = doc.mimeType?.trim() || obj.contentType || "application/octet-stream";
    } catch {
      return fail("파일을 읽을 수 없습니다.", 502, { code: "STORAGE_ERROR" });
    }

    const displayName = (doc.fileName || "document").slice(0, 200);
    const asciiFallback =
      displayName.replace(/[^\x20-\x7E]+/g, "_").replace(/"+/g, "_").slice(0, 200) || "document";

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(displayName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: unknown) {
    console.error("[LAWYER_VERIFICATION_CONTENT_TOKEN]", error);
    return fail("파일 전달 처리 실패", 500, { code: "INTERNAL_ERROR" });
  }
}
