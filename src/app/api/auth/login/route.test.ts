import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => {
  const findUnique = vi.fn();
  const lawyerProfileFindUnique = vi.fn();
  const update = vi.fn();
  return { findUnique, lawyerProfileFindUnique, update };
});

const auditMocks = vi.hoisted(() => ({
  writeAuditLog: vi.fn(),
}));

const passwordMocks = vi.hoisted(() => ({
  verifyPassword: vi.fn(),
}));

const jwtMocks = vi.hoisted(() => ({
  signAccessToken: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: prismaMocks.findUnique,
      update: prismaMocks.update,
    },
    lawyerProfile: {
      findUnique: prismaMocks.lawyerProfileFindUnique,
    },
  },
}));

vi.mock("@/lib/audit-log", () => auditMocks);
vi.mock("@/lib/auth/password", () => passwordMocks);
vi.mock("@/lib/auth/jwt", () => jwtMocks);

import { POST } from "./route";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/jwt";
import { writeAuditLog } from "@/lib/audit-log";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(signAccessToken).mockResolvedValue("demo-jwt");
    vi.mocked(verifyPassword).mockResolvedValue(false);
    vi.mocked(writeAuditLog).mockResolvedValue(undefined);
    prismaMocks.update.mockResolvedValue(undefined);
    prismaMocks.lawyerProfileFindUnique.mockResolvedValue(null);
  });

  it("일반 이메일 로그인은 ACTIVE 계정에서 정상 동작한다", async () => {
    vi.mocked(verifyPassword).mockResolvedValueOnce(true);

    prismaMocks.findUnique.mockResolvedValueOnce({
      id: "normal-user-id",
      email: "normal@aibupchin.com",
      passwordHash: "hashed-password",
      name: "일반 회원",
      role: "USER",
      status: "ACTIVE",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "normal@aibupchin.com",
          password: "real-password",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(prismaMocks.findUnique).toHaveBeenCalledWith({
      where: { email: "normal@aibupchin.com" },
    });

    const body = await response.json();
    expect(body.data.mode).toBe("STANDARD");
    expect(body.data.user.email).toBe("normal@aibupchin.com");
    expect(body.data.postLoginRedirect).toBe("/dashboard");
    expect(prismaMocks.lawyerProfileFindUnique).not.toHaveBeenCalled();
  });

  it("관리자는 기본 후속 경로를 /admin 으로 내려준다", async () => {
    vi.mocked(verifyPassword).mockResolvedValueOnce(true);

    prismaMocks.findUnique.mockResolvedValueOnce({
      id: "admin-id",
      email: "admin@aibupchin.com",
      passwordHash: "hashed-password",
      name: "관리자",
      role: "ADMIN",
      status: "ACTIVE",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@aibupchin.com",
          password: "real-password",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.postLoginRedirect).toBe("/admin");
  });

  it("승인 변호사는 기본 후속 경로를 /lawyer 로 내려준다", async () => {
    vi.mocked(verifyPassword).mockResolvedValueOnce(true);

    prismaMocks.findUnique.mockResolvedValueOnce({
      id: "lawyer-id",
      email: "lawyer@example.com",
      passwordHash: "hashed-password",
      name: "변호사",
      role: "LAWYER",
      status: "ACTIVE",
    });
    prismaMocks.lawyerProfileFindUnique.mockResolvedValueOnce({
      verificationStatus: "APPROVED",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "lawyer@example.com",
          password: "real-password",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.postLoginRedirect).toBe("/lawyer");
  });

  it("변호사 미승인이면 검증 대기 경로를 내려준다", async () => {
    vi.mocked(verifyPassword).mockResolvedValueOnce(true);

    prismaMocks.findUnique.mockResolvedValueOnce({
      id: "lawyer-id",
      email: "lawyer-pend@example.com",
      passwordHash: "hashed-password",
      name: "변호사",
      role: "LAWYER",
      status: "ACTIVE",
    });
    prismaMocks.lawyerProfileFindUnique.mockResolvedValueOnce({
      verificationStatus: "PENDING",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "lawyer-pend@example.com",
          password: "real-password",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.postLoginRedirect).toBe("/lawyer/verification-pending");
  });

  it("social-only account without passwordHash rejects password login", async () => {
    prismaMocks.findUnique.mockResolvedValueOnce({
      id: "oauth-user-id",
      email: "google-user@example.com",
      passwordHash: null,
      name: "Google User",
      role: "USER",
      status: "ACTIVE",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "google-user@example.com",
          password: "real-password",
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(verifyPassword).not.toHaveBeenCalled();

    const body = await response.json();
    expect(body.code).toBe("INVALID_CREDENTIALS");
  });

  it("PENDING 계정이면 403 ACCOUNT_PENDING과 역할 힌트를 반환한다", async () => {
    vi.mocked(verifyPassword).mockResolvedValueOnce(true);

    prismaMocks.findUnique.mockResolvedValueOnce({
      id: "pending-lawyer-id",
      email: "pending@example.com",
      passwordHash: "hashed-password",
      name: "대기 변호사",
      role: "LAWYER",
      status: "PENDING",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "pending@example.com",
          password: "password",
        }),
      }),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.code).toBe("ACCOUNT_PENDING");
    expect(body.pendingAccountRole).toBe("LAWYER");
    expect(body.message).toContain("가입 신청이 완료되었습니다");
  });
});
