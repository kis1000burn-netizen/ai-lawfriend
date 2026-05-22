import { describe, expect, it } from "vitest";
import {
  bulletsFromDescription,
  buildGuidanceCardForCaseView,
  summarizeInterviewAnswersPreview,
} from "./build-case-guidance-view";

describe("summarizeInterviewAnswersPreview", () => {
  it("flat object keys become lines", () => {
    const lines = summarizeInterviewAnswersPreview(
      { 피해: "금전", 발생일: "2024-01-01" },
      10,
      100,
    );
    expect(lines).toContain("피해: 금전");
    expect(lines).toContain("발생일: 2024-01-01");
  });

  it("returns empty for null or non-object", () => {
    expect(summarizeInterviewAnswersPreview(null, 5, 50)).toEqual([]);
    expect(summarizeInterviewAnswersPreview(undefined, 5, 50)).toEqual([]);
  });

  it("truncates long lines by maxCharsPerLine", () => {
    const long = "x".repeat(300);
    const lines = summarizeInterviewAnswersPreview({ k: long }, 5, 20);
    expect(lines[0]).toMatch(/^k: x+\…$/);
    expect(lines[0]!.length).toBeLessThanOrEqual(25);
  });
});

describe("bulletsFromDescription", () => {
  it("splits newline blocks and caps at 6 lines", () => {
    const text = ["a", "b", "c", "d", "e", "f", "g"].join("\n\n");
    const b = bulletsFromDescription(text);
    expect(b).toHaveLength(6);
    expect(b[5]).toBe("f");
  });

  it("returns empty on blank", () => {
    expect(bulletsFromDescription("   ")).toEqual([]);
  });
});

describe("buildGuidanceCardForCaseView", () => {
  it("uses criminal rule for 형사 and interview incomplete notice", () => {
    const m = buildGuidanceCardForCaseView({
      category: "형사",
      description: null,
      title: "테스트 제목",
      interviewCompleted: false,
      interviewAnswers: null,
    });
    expect(m.ruleKey).toBe("criminal");
    expect(m.caseCategoryLabel).toContain("형사");
    expect(m.situationSummaryBullets.some((x) => x.includes("인터뷰가 아직 완료"))).toBe(true);
    expect(m.situationSummaryBullets.some((x) => x.includes("테스트 제목"))).toBe(true);
  });

  it("falls back to default rule for unknown category", () => {
    const m = buildGuidanceCardForCaseView({
      category: "알수없음",
      description: "요약 줄",
      title: "무제",
      interviewCompleted: true,
      interviewAnswers: {},
    });
    expect(m.ruleKey).toBe("default");
    expect(m.situationSummaryBullets.some((x) => x.includes("요약 줄"))).toBe(true);
  });
});
