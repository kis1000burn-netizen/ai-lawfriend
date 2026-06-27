import { describe, expect, it } from "vitest";
import { analyzeLitigationDocumentContent } from "./document-analysis.engine";

describe("document-analysis.engine (Phase 13-D)", () => {
  it("extracts opponent answer claims with citations", () => {
    const result = analyzeLitigationDocumentContent({
      fileId: "file-1",
      caseId: "case-1",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "피고답변서.pdf",
      pages: [
        {
          pageNumber: 1,
          text: "피고는 원고의 청구를 다투며 다음과 같이 답변한다.",
          confidence: 0.96,
        },
        {
          pageNumber: 2,
          text: "원고가 지급한 금원은 투자금에 해당하며 대여금이 아니다. 금전 수령 사실은 인정한다.",
          confidence: 0.95,
        },
      ],
    });

    expect(result.analysisStatus).toBe("AI_ANALYZED");
    expect(result.summary.oneLine).toContain("투자금");
    expect(result.claims.length).toBeGreaterThan(0);
    expect(result.claims[0]?.citation.pageNumber).toBeGreaterThan(0);
    expect(result.claims[0]?.reviewStatus).toBe("NEEDS_LAWYER_REVIEW");
    expect(result.riskSignals.some((r) => r.riskType === "CASE_THEORY_CONFLICT_CANDIDATE")).toBe(
      true,
    );
  });

  it("does not emit forbidden final judgment fields", () => {
    const result = analyzeLitigationDocumentContent({
      fileId: "f",
      caseId: "c",
      documentType: "COURT_CORRECTION_ORDER",
      originalFileName: "보정명령.pdf",
      pages: [
        {
          pageNumber: 1,
          text: "피고 주소를 보정할 것. 7일 이내 제출하라.",
          confidence: 0.9,
        },
      ],
    });

    expect(result).not.toHaveProperty("finalLegalConclusion");
    expect(result).not.toHaveProperty("winningProbability");
    expect(result.deadlineCandidates.length).toBeGreaterThan(0);
    expect(result.deadlineCandidates[0]?.text).not.toContain("deadlineFinalDueAt");
  });

  it("analyzes the Joohwan land-access complaint package without final judgment", () => {
    const result = analyzeLitigationDocumentContent({
      fileId: "file-joohwan-complaint",
      caseId: "case-joohwan-land-access",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "소장 견본.docx",
      pages: [
        {
          pageNumber: 1,
          text:
            "피고는 2016년 토지 분할·등기 과정에서 원고 소유 24-1번지의 통행을 위하여 피고 소유 24번지 일부를 사용할 수 있도록 승낙하였고, 그 증거로 토지사용승낙서와 인감증명서를 제공하였다고 원고는 주장한다. 갑 제1호증 2016.10.10.자 매매계약서, 갑 제2호증 토지사용승낙서, 갑 제3호증 인감증명서가 제출될 예정이다.",
          confidence: 0.97,
        },
        {
          pageNumber: 2,
          text:
            "피고가 통행로 제공 약정을 이행하지 않아 원고는 통행지역권설정등기절차 이행과 예비적 주위토지통행권 확인을 구한다. 원고는 피고가 현장 확인과 측량을 방해하였다고 다투며, 내용증명에서는 수령일 다음 날부터 7일 이내 통행로 확정·제공과 방해 중지를 요청하였다.",
          confidence: 0.95,
        },
      ],
    });

    expect(result.analysisStatus).toBe("AI_ANALYZED");
    expect(result.summary.oneLine).toContain("핵심 주장 후보");
    expect(result.claims.some((claim) => claim.text.includes("토지사용승낙서"))).toBe(true);
    expect(result.claims.some((claim) => claim.text.includes("측량을 방해"))).toBe(true);
    expect(result.evidenceRefs.map((ref) => ref.label)).toEqual(
      expect.arrayContaining(["갑 제1호증", "갑 제2호증", "갑 제3호증"]),
    );
    expect(result.deadlineCandidates.some((deadline) => deadline.text.includes("7일 이내"))).toBe(
      true,
    );
    expect(result.riskSignals.some((risk) => risk.riskType === "DEADLINE_ATTENTION_CANDIDATE")).toBe(
      true,
    );
    expect(result).not.toHaveProperty("finalLegalConclusion");
    expect(result).not.toHaveProperty("winningProbability");
  });

  it("analyzes a recent construction-site injury compensation article fixture", () => {
    const result = analyzeLitigationDocumentContent({
      fileId: "file-construction-injury-news-20260618",
      caseId: "case-recent-construction-injury-20260618",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "2026-06-18-construction-injury-compensation-news.txt",
      pages: [
        {
          pageNumber: 1,
          text:
            "2026년 6월 18일 보도된 사건에서, 원고는 2017년 4월 서울 강서구 신축 오피스텔 공사 현장에서 3층으로 인양하던 소화배관이 약 10m 위에서 떨어져 사지마비와 인지 기능 저하 피해를 입었다고 주장한다. 항소심은 원청 시공사와 하청 기업이 공동으로 9억4000여만원을 배상하라고 판단하였다.",
          confidence: 0.96,
        },
        {
          pageNumber: 2,
          text:
            "피고들은 하청 기업 책임 또는 원고 개인 부주의를 주장하며 손해배상책임과 소멸시효를 다투었다. 그러나 재판부는 작업계획서와 다른 방식의 인양 작업을 방치한 관리감독 해태, 안전교육 부족, 후유장해 진단 전 손해 인식 곤란성을 근거로 피고 측 주장을 받아들이지 않았다. 갑 제1호증 작업계획서, 갑 제2호증 후유장해 진단서, 갑 제3호증 치료비·간병비 산정자료가 검토 대상이다.",
          confidence: 0.95,
        },
      ],
    });

    expect(result.analysisStatus).toBe("AI_ANALYZED");
    expect(result.summary.oneLine).toContain("핵심 주장 후보");
    expect(result.claims.some((claim) => claim.text.includes("사지마비"))).toBe(true);
    expect(result.claims.some((claim) => claim.text.includes("소멸시효"))).toBe(true);
    expect(result.facts.some((fact) => fact.text.includes("9억4000여만원"))).toBe(true);
    expect(result.evidenceRefs.map((ref) => ref.label)).toEqual(
      expect.arrayContaining(["갑 제1호증", "갑 제2호증", "갑 제3호증"]),
    );
    expect(
      result.deadlineCandidates.some((deadline) => deadline.text.includes("2026년 6월 18일")),
    ).toBe(true);
    expect(result).not.toHaveProperty("finalLegalConclusion");
    expect(result).not.toHaveProperty("winningProbability");
  });
});
