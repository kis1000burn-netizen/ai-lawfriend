import { describe, expect, it } from "vitest";

import { buildCaseSummaryGenerationContext } from "./case-summary-context-builder";

describe("case-summary-context-builder Phase 9-B", () => {
  it("includes case meta and rule-based buckets in prompt", () => {
    const result = buildCaseSummaryGenerationContext({
      case: {
        id: "c1",
        title: "사기 사건",
        category: "CRIMINAL",
        status: "IN_INTERVIEW",
      },
      interviewCompleted: false,
      answers: { case_background: "2024년 발생" },
      legacySummary: {
        overview: "1차 요약",
        timeline: ["2024"],
        keyIssues: ["기망"],
        missingInfo: ["증거"],
        checklist: ["확인"],
      },
      enriched: {
        outputContractApplied: true,
        contractSections: [{ heading: "사건 개요", body: "본문" }],
        flat: {
          caseOverview: "본문",
          timeline: ["2024"],
          issues: ["기망"],
          riskNotes: ["증거"],
          checklist: ["확인"],
        },
      },
    });

    expect(result.prompt).toContain("caseId: c1");
    expect(result.prompt).toContain("case_background");
    expect(result.ruleBasedContent.caseOverview).toBe("본문");
    expect(result.ruleBasedContent.contractSections?.[0]?.heading).toBe("사건 개요");
  });
});
