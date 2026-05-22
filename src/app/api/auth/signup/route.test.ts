import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => {
  const findUnique = vi.fn();
  const create = vi.fn();
  return { findUnique, create };
});

const passwordMocks = vi.hoisted(() => ({
  hashPassword: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: prismaMocks.findUnique,
      create: prismaMocks.create,
    },
  },
}));

vi.mock("@/lib/auth/password", () => passwordMocks);

import { POST } from "./route";
import { hashPassword } from "@/lib/auth/password";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hashPassword).mockResolvedValue("hashed-password");
  });

  it("creates an ACTIVE USER account from normalized signup input", async () => {
    prismaMocks.findUnique.mockResolvedValueOnce(null);
    prismaMocks.create.mockResolvedValueOnce({
      id: "user-1",
      email: "newuser@example.com",
      name: "새 사용자",
      role: "USER",
      status: "ACTIVE",
      createdAt: new Date("2026-04-29T00:00:00.000Z"),
    });

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: " NewUser@example.com ",
          password: "Password123!",
          name: " 새 사용자 ",
          phone: "01012345678",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(prismaMocks.findUnique).toHaveBeenCalledWith({
      where: { email: "newuser@example.com" },
      select: { id: true },
    });
    expect(prismaMocks.create).toHaveBeenCalledWith({
      data: {
        email: "newuser@example.com",
        passwordHash: "hashed-password",
        name: "새 사용자",
        phone: "01012345678",
        role: "USER",
        status: "ACTIVE",
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

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data.user.status).toBe("ACTIVE");
  });

  it("rejects duplicate emails before creating a user", async () => {
    prismaMocks.findUnique.mockResolvedValueOnce({ id: "existing-user" });

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "existing@example.com",
          password: "Password123!",
          name: "기존 사용자",
          phone: "01012345678",
        }),
      }),
    );

    expect(response.status).toBe(409);
    expect(prismaMocks.create).not.toHaveBeenCalled();

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("EMAIL_EXISTS");
  });
});