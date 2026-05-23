import { describe, expect, it, vi, beforeEach } from "vitest";

const getCaseAccessContext = vi.hoisted(() => vi.fn());

vi.mock("@/features/cases/case.permissions", () => ({
  getCaseAccessContext,
}));

import { ForbiddenError } from "@/lib/errors";
import { refreshCaseIntelligenceReviewSnapshot } from "./case-intelligence-review.service";

const staffUser = {
  id: "staff-1",
  email: "staff@example.com",
  role: "STAFF",
  name: "Staff",
  status: "ACTIVE",
} as const;

describe("case-intelligence-review permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("STAFF는 intelligence refresh(POST)를 persist 권한 없이 거부한다", async () => {
    getCaseAccessContext.mockResolvedValueOnce({
      isAdmin: false,
      isAssignedLawyer: false,
      isAssignedStaff: true,
      isOwner: false,
      canRead: true,
    });

    await expect(
      refreshCaseIntelligenceReviewSnapshot(staffUser, "case-1"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
