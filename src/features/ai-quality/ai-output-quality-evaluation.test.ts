import { describe, expect, it } from "vitest";
import {
  AI_OUTPUT_QUALITY_PASS_THRESHOLD,
  evaluateAiOutputQuality,
  resolveAiOutputQualityBand,
} from "./ai-output-quality-evaluation.policy";

describe("ai-output-quality-evaluation.policy (Phase 23-A)", () => {
  it("passes golden loan summary output", () => {
    const result = evaluateAiOutputQuality({
      evaluationCode: "EVAL-LOAN-CASE-SUMMARY-001",
      aiOutputText:
        "변제기 2024-06-30이 도과했으며, 일부 변제 후 잔액이 남아 있습니다.",
      expectedCriteria: {
        mustMention: ["변제기", "잔액"],
        mustNotInvent: ["판결", "승소"],
        citationRequired: false,
        maxHallucinationRisk: "LOW",
      },
    });

    expect(result.passed).toBe(true);
    expect(result.overallScore).toBeGreaterThanOrEqual(AI_OUTPUT_QUALITY_PASS_THRESHOLD);
    expect(result.band).toBe("PASS");
  });

  it("fails when invented legal outcome appears", () => {
    const result = evaluateAiOutputQuality({
      evaluationCode: "EVAL-LOAN-CASE-SUMMARY-001",
      aiOutputText: "변제기와 잔액을 확인했으며, 승소 확정되었습니다.",
      expectedCriteria: {
        mustMention: ["변제기", "잔액"],
        mustNotInvent: ["승소"],
        citationRequired: false,
        maxHallucinationRisk: "LOW",
      },
    });

    expect(result.passed).toBe(false);
    expect(result.dimensions.find((d) => d.dimension === "MUST_NOT_INVENT")?.passed).toBe(
      false,
    );
  });

  it("requires citation markers when citationRequired", () => {
    const result = evaluateAiOutputQuality({
      evaluationCode: "EVAL-LABOR-DOCUMENT-PARAGRAPH-001",
      aiOutputText: "임금 체불 사실과 근로 관계를 정리합니다.",
      expectedCriteria: {
        mustMention: ["임금", "근로"],
        mustNotInvent: ["승소 확정"],
        citationRequired: true,
        maxHallucinationRisk: "LOW",
      },
    });

    expect(result.dimensions.find((d) => d.dimension === "CITATION")?.passed).toBe(false);
  });

  it("resolves score bands", () => {
    expect(resolveAiOutputQualityBand(85)).toBe("PASS");
    expect(resolveAiOutputQualityBand(70)).toBe("REVIEW");
    expect(resolveAiOutputQualityBand(40)).toBe("FAIL");
  });
});
