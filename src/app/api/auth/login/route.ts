import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/domain-api-response";
import { loginSchema } from "@/lib/validators/auth";
import { writeAuditLog } from "@/lib/audit-log";
import {
  getDemoAccessConfig,
  validateDemoAccessCredentials,
} from "@/lib/auth/demo-access";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type LoginUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

async function findDemoAccessUser(loginId: string) {
  if (loginId.includes("@")) {
    return prisma.user.findUnique({
      where: { email: loginId },
    });
  }

  const candidates = await prisma.user.findMany({
    where: {
      email: {
        startsWith: `${loginId}@`,
        mode: "insensitive",
      },
    },
    take: 2,
  });

  if (candidates.length !== 1) {
    return null;
  }

  return candidates[0];
}

async function handleDemoAccessLogin(input: {
  loginId: string;
  password: string;
}) {
  const demoAccess = validateDemoAccessCredentials(input);

  if (!demoAccess) {
    return null;
  }

  const demoUser = await findDemoAccessUser(demoAccess.loginId);

  if (!demoUser) {
    return fail("데모 프리패스 계정 구성이 올바르지 않습니다.", 503, {
      code: "DEMO_ACCESS_INVALID",
    });
  }

  if (demoAccess.expectedRole && demoUser.role !== demoAccess.expectedRole) {
    return fail("데모 프리패스 계정 역할 구성이 올바르지 않습니다.", 503, {
      code: "DEMO_ACCESS_ROLE_MISMATCH",
    });
  }

  if (demoUser.status !== "ACTIVE") {
    return fail("데모 프리패스 계정이 현재 로그인할 수 없는 상태입니다.", 403, {
      code: "DEMO_ACCESS_BLOCKED",
    });
  }

  return buildLoginResponse(
    {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      status: demoUser.status,
    },
    "데모 프리패스 계정으로 로그인되었습니다.",
    "DEMO_ACCESS",
  );
}

async function buildLoginResponse(
  user: LoginUser,
  message: string,
  mode: "STANDARD" | "DEMO_ACCESS",
) {
  const token = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "AUTH_LOGIN_SUCCESS",
    entityType: "AUTH_SESSION",
    entityId: user.id,
    message,
    metadata: {
      mode,
    },
  });

  const response = ok({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
    mode,
    message,
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

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

    const identifier = parsed.data.email.trim();
    const demoResponse = await handleDemoAccessLogin({
      loginId: identifier,
      password: parsed.data.password,
    });

    if (demoResponse) {
      return demoResponse;
    }

    if (getDemoAccessConfig() && identifier === process.env.DEMO_ACCESS_ID?.trim()) {
      return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    const email = identifier.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    const isPasswordValid = await verifyPassword(
      parsed.data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    if (user.status === "PENDING") {
      return fail(
        "관리자 승인 대기 중입니다. 승인 후 다시 로그인해 주세요.",
        403,
        { code: "ACCOUNT_PENDING" },
      );
    }

    if (user.status !== "ACTIVE") {
      return fail("현재 로그인할 수 없는 계정입니다.", 403, { code: "ACCOUNT_BLOCKED" });
    }

    return buildLoginResponse(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      "로그인되었습니다.",
      "STANDARD",
    );
  } catch (error) {
    console.error("[LOGIN_POST_ERROR]", error);
    return fail("로그인 처리 중 오류가 발생했습니다.", 500, { code: "INTERNAL_ERROR" });
  }
}
