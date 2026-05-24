import { describe, expect, it } from "vitest";
import {
  assembleEvidenceTimelineIssuePack,
  deriveIssueItemsFromCandidates,
} from "./evidence-timeline-issue-pack.policy";

describe("evidence-timeline-issue-pack (Phase 23-D)", () => {
  it("derives issue items from candidates", () => {
    const issues = deriveIssueItemsFromCandidates(["보증금 반환", "명도"]);
    expect(issues).toHaveLength(2);
    expect(issues[0]?.label).toBe("보증금 반환");
  });

  it("assembles pack with cross-links", () => {
    const pack = assembleEvidenceTimelineIssuePack({
      caseId: "case-1",
      evidenceItems: [
        {
          evidenceId: "e1",
          filename: "contract.pdf",
          mappedIssueIds: ["issue-1"],
          lawyerReviewRequired: true,
        },
      ],
      timelineItems: [
        {
          timelineMemoId: "t1",
          occurredAt: new Date().toISOString(),
          summary: "계약 만료",
          memoType: "USER_NOTE",
        },
      ],
      issueCandidates: ["보증금 반환"],
    });

    expect(pack.evidenceItems).toHaveLength(1);
    expect(pack.issueItems).toHaveLength(1);
    expect(pack.crossLinks.length).toBeGreaterThan(0);
    expect(pack.disclaimer).toContain("변호사");
  });
});
