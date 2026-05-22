import { describe, expect, it } from "vitest";
import {
  gongbuhoPacketStatusBadgeClass,
  summarizeGongbuhoPacketJsonForAdmin,
  truncateGongbuhoPacketJsonPreview,
} from "@/features/gongbuho/admin-gongbuho-ui-model";

describe("summarizeGongbuhoPacketJsonForAdmin", () => {
  it("questionFlow/outputContract/summary 카운트를 반환한다", () => {
    const json = {
      questionFlow: [{ id: "a" }],
      outputContract: { summary: ["A", "B"] },
      validationRules: ["v1"],
      forbiddenRules: ["f1"],
      expertReviewPoints: ["e"],
    };

    expect(summarizeGongbuhoPacketJsonForAdmin(json)).toEqual({
      questionFlowCount: 1,
      outputContractSummaryCount: 2,
      validationRulesCount: 1,
      forbiddenRulesCount: 1,
      expertReviewPointsCount: 1,
    });
  });

  it("누락 필드 시 0으로 처리한다", () => {
    expect(summarizeGongbuhoPacketJsonForAdmin({})).toEqual({
      questionFlowCount: 0,
      outputContractSummaryCount: 0,
      validationRulesCount: 0,
      forbiddenRulesCount: 0,
      expertReviewPointsCount: 0,
    });
  });
});

describe("truncateGongbuhoPacketJsonPreview", () => {
  it("글자 초과 시 잘린다고 표시한다", () => {
    const s = truncateGongbuhoPacketJsonPreview({ hello: "x".repeat(200) }, 50);
    expect(s.includes("truncated")).toBe(true);
  });
});

describe("gongbuhoPacketStatusBadgeClass", () => {
  it("주요 상태에 Tailwind 패키지를 반환한다", () => {
    expect(gongbuhoPacketStatusBadgeClass("APPROVED")).toContain("emerald");
    expect(gongbuhoPacketStatusBadgeClass("REVIEW")).toContain("amber");
    expect(gongbuhoPacketStatusBadgeClass("ARCHIVED")).toContain("slate");
    expect(gongbuhoPacketStatusBadgeClass("DRAFT")).toContain("slate");
  });
});
