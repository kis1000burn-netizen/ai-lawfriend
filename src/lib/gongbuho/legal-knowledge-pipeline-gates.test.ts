import { describe, expect, it } from "vitest";
import {
  LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS,
  assertIntakeReadyForResearch,
  assertLawyerApprovedForDraft,
  assertNoProhibitedJsonKeys,
  scanProhibitedJsonKeys,
  validateCanonicalSourceRefs,
} from "@/lib/gongbuho/legal-knowledge-pipeline-gates";

describe("legal-knowledge-pipeline-gates", () => {
  it("금지 sourceKind를 거부한다", () => {
    const result = validateCanonicalSourceRefs([
      {
        sourceKind: "NAVER_SNIPPET",
        citationKey: "x",
        summaryPointer: "y",
      },
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KIND");
    }
  });

  it("canonicalSourceRefs 빈 배열을 거부한다", () => {
    const result = validateCanonicalSourceRefs([]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("LEGAL_KNOWLEDGE_CANONICAL_SOURCES_REQUIRED");
    }
  });

  it("허용 canonical ref는 통과한다", () => {
    const result = validateCanonicalSourceRefs([
      {
        sourceKind: "STATUTE",
        citationKey: "민법 제565조",
        summaryPointer: "임대차 종료 시 원상회복",
      },
    ]);
    expect(result).toEqual({ ok: true });
  });

  it("금지 JSON 키 rawSnippet을 탐지한다", () => {
    const hits = scanProhibitedJsonKeys({ query: { rawSnippet: "ugc" } });
    expect(hits).toContain("query.rawSnippet");
    expect(() =>
      assertNoProhibitedJsonKeys({ rawSnippet: "ugc" }),
    ).toThrow(/LEGAL_KNOWLEDGE_PROHIBITED_FIELD/);
  });

  it("READY_FOR_RESEARCH gate", () => {
    expect(() => assertIntakeReadyForResearch("DRAFT")).toThrow(
      "LEGAL_KNOWLEDGE_INTAKE_NOT_READY_FOR_RESEARCH",
    );
    expect(() => assertIntakeReadyForResearch("READY_FOR_RESEARCH")).not.toThrow();
  });

  it("APPROVE_FOR_PACKET_DRAFT gate", () => {
    expect(() => assertLawyerApprovedForDraft("REJECT")).toThrow(
      "LEGAL_KNOWLEDGE_LAWYER_APPROVAL_REQUIRED",
    );
    expect(() =>
      assertLawyerApprovedForDraft("APPROVE_FOR_PACKET_DRAFT"),
    ).not.toThrow();
  });

  it("verify forbidden source kinds SSOT", () => {
    expect(LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS).toContain("KNOWLEDGE_IN");
    expect(LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS).toContain("BLOG");
  });
});
