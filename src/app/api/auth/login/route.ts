import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/domain-api-response";
import { normalizeAuthRedirectPath } from "@/lib/auth/oauth";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";
import { buildJsonLoginResponse } from "@/lib/auth/login-response";
import type { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return fail("입력값이 올바르지 않습니다.", 422, {
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    if (!user.passwordHash) {
      return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    const isPasswordValid = await verifyPassword(
      parsed.data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    if (user.status === "PENDING") {
      return fail(
        "가입 신청이 완료되었습니다. 관리자 승인 후 서비스를 이용할 수 있습니다.",
        403,
        { code: "ACCOUNT_PENDING", pendingAccountRole: user.role },
      );
    }

    if (user.status !== "ACTIVE") {
      return fail("현재 로그인할 수 없는 계정입니다.", 403, { code: "ACCOUNT_BLOCKED" });
    }

    let lawyerVerificationApproved = user.role !== "LAWYER";
    if (user.role === "LAWYER") {
      const profile = await prisma.lawyerProfile.findUnique({
        where: { userId: user.id },
        select: { verificationStatus: true },
      });
      lawyerVerificationApproved = profile?.verificationStatus === "APPROVED";
    }

    const redirectInput =
      typeof parsed.data.redirect === "string" && parsed.data.redirect.trim() !== ""
        ? parsed.data.redirect.trim()
        : undefined;

    const postLoginRedirect = resolvePostAuthRedirect({
      normalizedRequestPath: normalizeAuthRedirectPath(redirectInput),
      role: user.role as UserRole,
      lawyerVerificationApproved,
    });

    return buildJsonLoginResponse(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      {
        message: "로그인되었습니다.",
        mode: "STANDARD",
        postLoginRedirect,
      },
    );
  } catch (error) {
    console.error("[LOGIN_POST_ERROR]", error);
    return fail("로그인 처리 중 오류가 발생했습니다.", 500, { code: "INTERNAL_ERROR" });
  }
}
