import { describe, expect, it } from "vitest";
import { buildDocumentGenerationPrompt } from "./build-document-generation-prompt";
import {
  checkForbiddenAssertions,
  DOCUMENT_GENERATION_POLICIES,
  resolveDocumentGenerationPolicy,
} from "./document-generation-policy";

describe("document generation policy", () => {
  it("defaults to NO_UNVERIFIED_FACTS", () => {
    expect(resolveDocumentGenerationPolicy(null)).toBe(
      DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS,
    );

    expect(resolveDocumentGenerationPolicy(undefined)).toBe(
      DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS,
    );

    expect(resolveDocumentGenerationPolicy("UNKNOWN")).toBe(
      DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS,
    );
  });

  it("builds a prompt with NO_UNVERIFIED_FACTS guardrail", () => {
    const result = buildDocumentGenerationPrompt({
      documentType: "COMPLAINT",
      templateTitle: "고소장",
      caseSummary: "피해금액 3,500만원",
      interviewAnswers: {
        victimName: "홍길동",
      },
      officialFormTrace: {
        sourceKey: "internal-standard-complaint",
      },
      generationPolicy: DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS,
    });

    expect(result.prompt).toContain("NO_UNVERIFIED_FACTS");
    expect(result.prompt).toContain("입력 자료에 없는 사실은 생성하지 마십시오");
    expect(result.prompt).toContain("법령·판례·증거");
    expect(result.prompt).toContain("[공식 서식 추출 원문(발췌·참고)]");
    expect(result.prompt).toContain("등록된 추출 원문이 없습니다.");
    expect(result.guardrail.policy).toBe(
      DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS,
    );
  });

  it("embeds officialFormParsedTextExcerpt in the dedicated block", () => {
    const result = buildDocumentGenerationPrompt({
      documentType: "STATEMENT",
      officialFormTrace: { sourceProvider: "SCOURT" },
      officialFormParsedTextExcerpt: "제1조 목적\n서식 본문 발췌",
    });
    expect(result.prompt).toContain("제1조 목적");
  });

  it("appends gongbuhoRulesAppendix when provided (Phase 3-F)", () => {
    const result = buildDocumentGenerationPrompt({
      documentType: "STATEMENT",
      gongbuhoRulesAppendix: "[공부호 패킷 · 검증·금지 규칙 참고]\n1. 테스트 규칙",
    });
    expect(result.prompt).toContain("[공부호 패킷 · 검증·금지 규칙 참고]");
    expect(result.prompt).toContain("테스트 규칙");
  });

  it("keeps WARNING missing fields as supplementation guidance only", () => {
    const result = buildDocumentGenerationPrompt({
      documentType: "COMPLAINT",
      missingWarningFields: [
        {
          fieldKey: "defendantAddress",
          label: "피고소인 주소",
          severity: "WARNING",
          suggestedQuestions: ["피고소인의 주소를 알고 계신가요?"],
        },
      ],
    });

    expect(result.prompt).toContain("WARNING 누락 항목");
    expect(result.prompt).toContain("피고소인 주소");
    expect(result.prompt).toContain("사실처럼 단정하여 삽입하면 안 됩니다");
  });

  it("detects forbidden assertion patterns", () => {
    const result = checkForbiddenAssertions(
      "대법원 2020. 1. 1. 선고 판례에 따라 확실히 승소합니다.",
    );

    expect(result.passed).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("passes plain cautious text", () => {
    const result = checkForbiddenAssertions(
      "제출 자료 기준으로 추가 확인이 필요합니다.",
    );

    expect(result.passed).toBe(true);
    expect(result.issues).toEqual([]);
  });
});