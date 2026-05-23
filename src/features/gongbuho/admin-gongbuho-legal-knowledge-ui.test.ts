import { describe, expect, it } from "vitest";
import {
  canCreateResearchBriefForIntake,
  canMarkBriefReadyForReview,
  canRecordLawyerReviewOnBrief,
  deriveLegalKnowledgeAdminCapabilities,
  readNormalizedKeywordFromIntake,
} from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";

describe("admin-gongbuho-legal-knowledge-ui", () => {
  it("STAFF는 조회만, ADMIN은 write/compile 가능", () => {
    const staff = deriveLegalKnowledgeAdminCapabilities({ role: "STAFF" });
    expect(staff.canRead).toBe(true);
    expect(staff.canWriteIntakeOrBrief).toBe(false);
    expect(staff.canCompilePacketDraft).toBe(false);
    expect(staff.staffReadOnlyBanner).toContain("ADMIN");

    const admin = deriveLegalKnowledgeAdminCapabilities({ role: "ADMIN" });
    expect(admin.canWriteIntakeOrBrief).toBe(true);
    expect(admin.canCompilePacketDraft).toBe(true);
    expect(admin.canRecordLawyerReview).toBe(true);
  });

  it("LAWYER는 review만 가능", () => {
    const lawyer = deriveLegalKnowledgeAdminCapabilities({ role: "LAWYER" });
    expect(lawyer.canRecordLawyerReview).toBe(true);
    expect(lawyer.canWriteIntakeOrBrief).toBe(false);
    expect(lawyer.canCompilePacketDraft).toBe(false);
  });

  it("intake keyword 파싱", () => {
    expect(
      readNormalizedKeywordFromIntake({ normalizedKeyword: "전세보증금" }),
    ).toBe("전세보증금");
  });

  it("brief action gates", () => {
    expect(canCreateResearchBriefForIntake("READY_FOR_RESEARCH")).toBe(true);
    expect(canCreateResearchBriefForIntake("DRAFT")).toBe(false);
    expect(canMarkBriefReadyForReview("DRAFT")).toBe(true);
    expect(canRecordLawyerReviewOnBrief("READY_FOR_LAWYER_REVIEW")).toBe(true);
  });
});
