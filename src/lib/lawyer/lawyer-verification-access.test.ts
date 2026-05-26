import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaLawyerMocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lawyerProfile: prismaLawyerMocks,
  },
}));

import {
  assertLawyerProfessionalAccess,
  getLawyerVerificationStatusForUser,
} from "@/lib/lawyer/lawyer-verification-access";
import type { SessionUser } from "@/lib/auth/session";

describe("lawyer-verification-access (스모크)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AIBEOPCHIN_POST_DEPLOY_PROMO_DISABLED = "true";
  });

  it("LAWYER·APPROVED 는 assert 통과", async () => {
    prismaLawyerMocks.findUnique.mockResolvedValueOnce({ verificationStatus: "APPROVED" });
    await expect(
      assertLawyerProfessionalAccess({
        id: "u1",
        role: "LAWYER",
      } as SessionUser),
    ).resolves.toBeUndefined();
  });

  it("LAWYER·PENDING 는 LAWYER_VERIFICATION_REQUIRED", async () => {
    prismaLawyerMocks.findUnique.mockResolvedValueOnce({ verificationStatus: "PENDING" });
    await expect(
      assertLawyerProfessionalAccess({
        id: "u1",
        role: "LAWYER",
      } as SessionUser),
    ).rejects.toMatchObject({ code: "LAWYER_VERIFICATION_REQUIRED", statusCode: 403 });
  });

  it("ADMIN 은 프로필 조회 없이 통과", async () => {
    await expect(
      assertLawyerProfessionalAccess({
        id: "a1",
        role: "ADMIN",
      } as SessionUser),
    ).resolves.toBeUndefined();
    expect(prismaLawyerMocks.findUnique).not.toHaveBeenCalled();
  });

  it("getLawyerVerificationStatusForUser 는 프로필 없으면 null", async () => {
    prismaLawyerMocks.findUnique.mockResolvedValueOnce(null);
    await expect(getLawyerVerificationStatusForUser("u1")).resolves.toBeNull();
  });
});
