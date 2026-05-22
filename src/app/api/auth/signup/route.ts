import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/domain-api-response";
import { signUpSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { Prisma, UserRole, UserStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return fail("입력값이 올바르지 않습니다.", 422, {
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const passwordHash = await hashPassword(parsed.data.password);

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return fail("이미 가입된 이메일입니다.", 409, { code: "EMAIL_EXISTS" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name.trim(),
        phone: parsed.data.phone?.trim() || null,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return ok(
      {
        user,
        message:
          "가입이 완료되었습니다. 로그인 후 이용해 주세요.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("이미 가입된 이메일입니다.", 409, { code: "EMAIL_EXISTS" });
    }

    console.error("[SIGNUP_POST_ERROR]", error);
    return fail("회원가입 처리 중 오류가 발생했습니다.", 500, {
      code: "INTERNAL_ERROR",
    });
  }
}
