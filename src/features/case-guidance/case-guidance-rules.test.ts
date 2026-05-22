import { describe, expect, it } from "vitest";
import { buildCaseGuidanceCard, resolveCaseGuidanceRule } from "./case-guidance-rules";

describe("resolveCaseGuidanceRule", () => {
  it("matches 형사·민사·가사 literally", () => {
    expect(resolveCaseGuidanceRule("형사").key).toBe("criminal");
    expect(resolveCaseGuidanceRule("민사").key).toBe("civil");
    expect(resolveCaseGuidanceRule("가사").key).toBe("family");
  });

  it("trims whitespace on category string", () => {
    expect(resolveCaseGuidanceRule(" 형사 ").key).toBe("criminal");
  });

  it("defaults for null empty or unknown", () => {
    expect(resolveCaseGuidanceRule(null).key).toBe("default");
    expect(resolveCaseGuidanceRule(undefined).key).toBe("default");
    expect(resolveCaseGuidanceRule("").key).toBe("default");
    expect(resolveCaseGuidanceRule("commercial").key).toBe("default");
  });
});

describe("buildCaseGuidanceCard", () => {
  it("includes interview completed wording", () => {
    const m = buildCaseGuidanceCard({
      category: "민사",
      interviewCompleted: true,
      situationBulletsFromInputs: ["a"],
    });
    expect(m.situationSummaryBullets.some((x) => x.includes("인터뷰가 완료"))).toBe(true);
  });

  it("adds booster copy when bullets are scarce", () => {
    const m = buildCaseGuidanceCard({
      category: "",
      interviewCompleted: true,
      situationBulletsFromInputs: [],
    });
    expect(
      m.situationSummaryBullets.some((x) => x.includes("등록된 사건 정보가 부족")),
    ).toBe(true);
  });
});
