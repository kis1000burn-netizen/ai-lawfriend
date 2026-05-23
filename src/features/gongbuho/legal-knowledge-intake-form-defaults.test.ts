import { describe, expect, it } from "vitest";
import { buildLegalKnowledgeIntakeCreatePayload } from "@/features/gongbuho/legal-knowledge-intake-form-defaults";

describe("legal-knowledge-intake-form-defaults", () => {
  it("READY_FOR_RESEARCH payload를 생성한다", () => {
    const payload = buildLegalKnowledgeIntakeCreatePayload({
      normalizedKeyword: "전세보증금 반환",
      mappedCaseType: "JEONSE",
    });
    expect(payload.status).toBe("READY_FOR_RESEARCH");
    expect(payload.intakeCompliance.noRawUgcStored).toBe(true);
    expect(payload.querySignature.normalizedKeyword).toBe("전세보증금 반환");
    expect(payload.caseTypeMapping.mappedCaseType).toBe("JEONSE");
  });
});
