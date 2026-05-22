import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/domain-api-response";
import { getSessionUser } from "@/lib/auth/session";
import { createLawyerVerificationDocumentFromForm } from "@/lib/lawyer/lawyer-verification-document-upload";

export const dynamic = "force-dynamic";

/**
 * 변호사 본인 프로필 증빙 파일 업로드(P2). 서버가 private storage 에 저장 후 `storageKey` 등만 DB에 기록한다.
 * 공개 `fileUrl` 은 저장하지 않는다.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("로그인이 필요합니다.", 401, { code: "UNAUTHORIZED" });
    }
    if (user.role !== "LAWYER") {
      return fail("변호사 계정만 업로드할 수 있습니다.", 403, { code: "FORBIDDEN" });
    }

    const profile = await prisma.lawyerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) {
      return fail("변호사 프로필이 없습니다.", 404, { code: "NOT_FOUND" });
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return fail("요청 본문을 읽을 수 없습니다.", 400, { code: "VALIDATION_ERROR" });
    }

    return createLawyerVerificationDocumentFromForm(profile.id, form);
  } catch (error: unknown) {
    console.error("[LAWYER_VERIFICATION_DOCUMENT_UPLOAD]", error);
    return fail("증빙 업로드 처리 중 오류가 발생했습니다.", 500, { code: "INTERNAL_ERROR" });
  }
}
