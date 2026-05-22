import { describe, expect, it } from "vitest";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";

describe("resolvePostAuthRedirect", () => {
  it("변호사 미승인이면 승인 대기 경로", () => {
    expect(
      resolvePostAuthRedirect({
        normalizedRequestPath: "/dashboard",
        role: "LAWYER",
        lawyerVerificationApproved: false,
      }),
    ).toBe("/lawyer/verification-pending");
  });

  it("변호사 승인 후 기본 경로는 역할 홈으로 매핑", () => {
    expect(
      resolvePostAuthRedirect({
        normalizedRequestPath: "/dashboard",
        role: "LAWYER",
        lawyerVerificationApproved: true,
      }),
    ).toBe("/lawyer");

    expect(
      resolvePostAuthRedirect({
        normalizedRequestPath: "/dashboard",
        role: "SUPER_ADMIN",
        lawyerVerificationApproved: true,
      }),
    ).toBe("/admin");
  });

  it("비일반 구체 경로는 의뢰인도 유지", () => {
    expect(
      resolvePostAuthRedirect({
        normalizedRequestPath: "/cases/abc/interview",
        role: "USER",
        lawyerVerificationApproved: true,
      }),
    ).toBe("/cases/abc/interview");
  });
});
