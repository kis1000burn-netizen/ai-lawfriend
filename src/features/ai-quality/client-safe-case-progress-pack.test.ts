import { describe, expect, it } from "vitest";
import {
  assembleClientSafeCaseProgressPack,
  buildClientSafeProgressMilestones,
} from "./client-safe-case-progress-pack.policy";
import { CLIENT_SAFE_BLOCKED_CATEGORIES } from "@/features/ai-core/client-safe-disclosure.schema";

describe("client-safe-case-progress-pack (Phase 23-E)", () => {
  it("blocks internal categories from client pack", () => {
    const pack = assembleClientSafeCaseProgressPack({
      caseId: "case-1",
      caseStatus: "IN_INTERVIEW",
      hasReleasedStatements: false,
    });

    expect(pack.blockedCategories).toEqual([...CLIENT_SAFE_BLOCKED_CATEGORIES]);
    expect(pack.disclaimer).toContain("의뢰인");
  });

  it("builds milestones for interview in progress", () => {
    const milestones = buildClientSafeProgressMilestones("IN_INTERVIEW");
    expect(milestones.find((m) => m.label === "인터뷰 진행")?.status).toBe("IN_PROGRESS");
  });

  it("passes release gate when statements released", () => {
    const pack = assembleClientSafeCaseProgressPack({
      caseId: "case-1",
      caseStatus: "REVIEW_PENDING",
      hasReleasedStatements: true,
    });

    expect(pack.releaseGatePassed).toBe(true);
    expect(pack.emptyReleaseNotice).toBeUndefined();
  });
});
