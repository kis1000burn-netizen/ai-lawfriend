import { describe, expect, it } from "vitest";
import { CASE_PACK_BUILDER_TEMPLATES } from "./case-pack-builder.registry";
import {
  buildCasePackBuilderResult,
  resolveCasePackTypeFromCaseCategory,
} from "./case-pack-builder.policy";
import { AI_EVALUATION_CASE_PACK_TYPES } from "./ai-evaluation-dataset.schema";

describe("case-pack-builder (Phase 23-C)", () => {
  it("defines templates for all pack types", () => {
    for (const packType of AI_EVALUATION_CASE_PACK_TYPES) {
      expect(CASE_PACK_BUILDER_TEMPLATES.some((template) => template.packType === packType)).toBe(
        true,
      );
    }
  });

  it("resolves pack type from case category", () => {
    expect(resolveCasePackTypeFromCaseCategory("LOAN")).toBe("LOAN");
    expect(resolveCasePackTypeFromCaseCategory("unknown")).toBe("GENERIC");
  });

  it("builds case pack builder result with disclaimer", () => {
    const result = buildCasePackBuilderResult({
      caseId: "case-1",
      packType: "LABOR",
      caseTitle: "임금 체불",
    });

    expect(result.packageTitle).toContain("노동");
    expect(result.sectionsIncluded).toContain("summary");
    expect(result.issueFocusLabels).toContain("임금");
    expect(result.disclaimer).toContain("변호사");
  });
});
