import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import {
  assertLawyerProfessionalAccess,
} from "@/lib/lawyer/lawyer-verification-access";
import {
  buildAccessibleCaseWhere,
  canRequestSoftDelete,
  isPlatformAdmin,
} from "@/features/cases/case.permissions";
import type { SessionUser } from "@/lib/auth/require-session-user";

vi.mock("@/lib/lawyer/lawyer-verification-access", () => ({
  assertLawyerProfessionalAccess: vi.fn().mockResolvedValue(undefined),
}));

const baseUser = (over: Partial<SessionUser>): SessionUser => ({
  id: "u1",
  name: "T",
  email: "t@t",
  status: "ACTIVE",
  role: "USER",
  ...over,
});

describe("case.permissions — RB-02 서버 권한 기준(요약)", () => {
  beforeEach(() => {
    vi.mocked(assertLawyerProfessionalAccess).mockResolvedValue(undefined);
  });

  it("isPlatformAdmin — ADMIN·SUPER_ADMIN만", () => {
    expect(isPlatformAdmin("ADMIN")).toBe(true);
    expect(isPlatformAdmin("SUPER_ADMIN")).toBe(true);
    expect(isPlatformAdmin("LAWYER")).toBe(false);
  });

  it("buildAccessibleCaseWhere — USER는 본인 owner만", async () => {
    const w = await buildAccessibleCaseWhere(baseUser({ id: "client1", role: "USER" }));
    expect(w).toMatchObject({
      status: { not: "DELETED" },
      ownerUserId: "client1",
    });
  });

  it("buildAccessibleCaseWhere — 승인된 LAWYER는 본인 소유 또는 배정", async () => {
    const w = await buildAccessibleCaseWhere(baseUser({ id: "law1", role: "LAWYER" }));
    expect(w).toMatchObject({ status: { not: "DELETED" } });
    expect(w).toHaveProperty("OR");
  });

  it("buildAccessibleCaseWhere — 미승인 LAWYER는 빈 id 집합", async () => {
    vi.mocked(assertLawyerProfessionalAccess).mockRejectedValueOnce(
      new AppError("x",403,"LAWYER_VERIFICATION_REQUIRED"),
    );
    const w = await buildAccessibleCaseWhere(baseUser({ id: "law1", role: "LAWYER" }));
    expect(w).toEqual({ id: { in: [] } });
  });

  it("canRequestSoftDelete — 소유자 또는 플랫폼 관리자(DELETED 제외)", () => {
    expect(
      canRequestSoftDelete(baseUser({ id: "o1" }), { ownerUserId: "o1", status: "CREATED" }),
    ).toBe(true);
    expect(
      canRequestSoftDelete(baseUser({ id: "o2" }), { ownerUserId: "o1", status: "CREATED" }),
    ).toBe(false);
    expect(
      canRequestSoftDelete(baseUser({ id: "a1", role: "ADMIN" }), {
        ownerUserId: "o1",
        status: "CREATED",
      }),
    ).toBe(true);
    expect(
      canRequestSoftDelete(baseUser({ id: "o1" }), { ownerUserId: "o1", status: "DELETED" }),
    ).toBe(false);
  });
});
