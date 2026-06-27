import { describe, expect, it, vi, beforeEach } from "vitest";

const listAttachments = vi.hoisted(() => vi.fn());

vi.mock("@/features/case-attachments/case-attachment.service", () => ({
  listCaseAttachmentsService: listAttachments,
}));

import {
  buildCaseIntelligenceGraphRuntime,
  PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME_MARKER,
} from "./case-intelligence-graph-runtime.service";

describe("case-intelligence-graph-runtime Phase 9-E", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAttachments.mockResolvedValue([]);
  });

  it("exposes marker", () => {
    expect(PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME_MARKER).toBe(
      "PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME",
    );
  });

  it("builds graph and radar from interview + summary content", async () => {
    const result = await buildCaseIntelligenceGraphRuntime({
      currentUser: {
        id: "u1",
        email: "a@b.com",
        name: "User",
        role: "USER",
        status: "ACTIVE",
      },
      caseId: "c1",
      generatedAt: "2026-05-23T12:00:00.000Z",
      caseSummaryAiMode: "RULE_BASED",
      summaryOperation: "CASE_SUMMARY_GENERATE",
      answers: { case_background: "2025년 3월 임금 미지급", evidence_summary: "계약서" },
      validatedContent: {
        caseOverview: "임금 체불 사건",
        timeline: ["2025년 3월부터 미지급"],
        issues: ["임금 체불"],
        riskNotes: [],
        checklist: [],
      },
      gongbuhoResolution: {
        via: "trace",
        code: "WAGE_BACKPAY",
        version: "1.0.0",
      },
    });

    expect(result.graph.graphVersion).toBe("9-D.1");
    expect(result.graph.claims.length).toBeGreaterThan(1);
    expect(result.radar.radarVersion).toBe("9-E.1");
    expect(result.ledger.ledgerVersion).toBe("9-F.1");
    expect(result.ledgerValidationPassed).toBe(true);
    expect(
      result.radar.signals.some((s) => s.signalType === "MISSING_EVIDENCE"),
    ).toBe(true);
  });

  it("accepts the Joohwan land-access dispute as an interview case fixture", async () => {
    const result = await buildCaseIntelligenceGraphRuntime({
      currentUser: {
        id: "u-joohwan",
        email: "client@example.com",
        name: "Client",
        role: "USER",
        status: "ACTIVE",
      },
      caseId: "case-joohwan-land-access",
      generatedAt: "2026-06-20T07:30:00.000Z",
      caseSummaryAiMode: "RULE_BASED",
      summaryOperation: "CASE_SUMMARY_GENERATE",
      answers: {
        case_background:
          "2016년 10월 10일 세종특별자치시 연서면 월하리의 분할 전 1,206㎡ 토지를 매매한 뒤 2016년 11월 7일 24번지와 24-1번지 각 603㎡로 분할 등기하였다. 피고 이상열은 도로에 접한 24번지를 소유하고, 원고 이양화 측은 도로 안쪽 24-1번지를 소유하게 되었다.",
        current_status:
          "24-1번지는 통행로가 없으면 사실상 맹지가 되고, 피고는 토지사용승낙서와 인감증명서를 제공했음에도 통행로 제공 약정을 장기간 이행하지 않았으며 현장 확인과 측량 시도를 방해하였다.",
        desired_result:
          "통행지역권설정등기절차 이행, 예비적 주위토지통행권 확인, 통행·측량·통행로 개설 방해금지, 필요 시 손해배상을 원한다.",
        evidence_summary:
          "2016.10.10 매매계약서, 이상열 명의 토지사용승낙서, 인감증명서, 24번지와 24-1번지 등기사항전부증명서, 토지대장, 지적도, 현장 사진, 경찰 신고 이력, 문자와 녹취록이 필요하다.",
        people_involved:
          "원고 이양화, 실질 협의 당사자 장주환, 피고 이상열",
      },
      validatedContent: {
        caseOverview:
          "세종 월하리 24번지/24-1번지 분할 후 통행로 제공 약정 이행을 구하는 토지 통행로 분쟁",
        timeline: [
          "2016년 10월 10일 분할 전 토지 매매계약 체결",
          "2016년 11월 7일 24번지와 24-1번지로 분할 등기",
          "등기 이후 피고가 통행로 제공 약정 이행을 거부하고 측량을 방해",
          "2026년 내용증명 발송 및 본안소송·가처분 준비",
        ],
        issues: [
          "통행로 제공 약정 또는 통행지역권 설정 약정 성립 여부",
          "분할로 인한 주위토지통행권 인정 여부",
          "통행·측량·통행로 개설 방해금지 필요성",
        ],
        riskNotes: [
          "통행로 위치와 폭은 별지 도면, 현황측량 또는 감정으로 특정해야 한다.",
          "토지사용승낙서 원본과 인감증명서의 진정성립 확인이 중요하다.",
        ],
        checklist: [
          "매매계약서 원본 확보",
          "토지사용승낙서 원본 및 인감증명서 확인",
          "등기부·토지대장·지적도·토지이용계획확인원 발급",
          "현장 사진과 측량 방해 증거 정리",
        ],
      },
      gongbuhoResolution: {
        via: "trace",
        code: "LAND_ACCESS_EASEMENT",
        version: "joohwan-fixture-20260620",
      },
    });

    expect(result.graph.graphVersion).toBe("9-D.1");
    expect(result.graph.claims.length).toBeGreaterThanOrEqual(5);
    expect(result.graph.claims.some((claim) => claim.text.includes("통행지역권"))).toBe(true);
    expect(result.graph.claims.some((claim) => claim.text.includes("토지사용승낙서"))).toBe(
      true,
    );
    expect(result.radar.radarVersion).toBe("9-E.1");
    expect(result.ledgerValidationPassed).toBe(true);
  });

  it("accepts a recent construction-site injury compensation case fixture", async () => {
    const result = await buildCaseIntelligenceGraphRuntime({
      currentUser: {
        id: "u-industrial-accident",
        email: "worker@example.com",
        name: "Worker",
        role: "USER",
        status: "ACTIVE",
      },
      caseId: "case-recent-construction-injury-20260618",
      generatedAt: "2026-06-20T07:55:00.000Z",
      caseSummaryAiMode: "RULE_BASED",
      summaryOperation: "CASE_SUMMARY_GENERATE",
      answers: {
        case_background:
          "2017년 4월 서울 강서구 신축 오피스텔 공사 현장에서 3층으로 인양하던 소화배관이 약 10m 위에서 지하 1층 작업자에게 떨어져 중대한 상해가 발생했다.",
        current_status:
          "피해자는 사지마비, 인지 기능 저하, 노동능력 100% 상실을 주장하며 원청 시공사와 하청 기업을 상대로 예방조치 의무 위반에 따른 손해배상을 청구하였다.",
        desired_result:
          "향후 치료비, 의료보조비, 간병비 등을 포함한 손해배상과 원청·하청의 공동 책임 인정을 원한다.",
        civil_damage_or_claim:
          "항소심은 피고들이 공동으로 약 9억4000여만원을 배상해야 한다고 판단한 사례로, 안전관리·작업계획서 준수·관리감독 해태가 핵심 쟁점이다.",
        evidence_summary:
          "작업계획서, 인양 작업 변경 경위, 현장소장·안전관리담당자 관리감독 자료, 추락 위치와 안전거리 자료, 후유장해 진단서, 치료비·간병비 산정 자료가 필요하다.",
        people_involved:
          "피해 노동자, 원청 시공사, 하청 기업, 현장소장, 안전관리담당자",
      },
      validatedContent: {
        caseOverview:
          "건설현장 소화배관 추락으로 중상해를 입은 노동자의 산업재해 손해배상 사건",
        timeline: [
          "2017년 4월 서울 강서구 오피스텔 공사 현장에서 소화배관 추락 사고 발생",
          "피해자가 사지마비와 인지 기능 저하 등 중대한 후유장해를 입음",
          "원청과 하청이 책임·개인 과실·소멸시효를 다툼",
          "2026년 6월 항소심에서 약 9억4000여만원 배상 판단이 보도됨",
        ],
        issues: [
          "원청 시공사의 작업현장 관리감독 의무 위반 여부",
          "작업계획서와 다른 인양 방식 변경에 대한 예측·지배 가능성",
          "피해자 개인 과실 및 소멸시효 항변 배척 여부",
          "향후 치료비·의료보조비·간병비 등 손해액 산정",
        ],
        riskNotes: [
          "기사 기반 fixture이므로 실제 소송 입력 전 판결문과 진단자료 확인이 필요하다.",
          "소멸시효 기산점은 후유장해 진단과 손해 인식 시점 확인이 필요하다.",
        ],
        checklist: [
          "작업계획서와 변경 작업 지시 자료 확보",
          "현장 안전교육 및 관리감독 기록 확보",
          "후유장해 진단서와 향후 치료비 산정 자료 확보",
          "사고 위치·추락 물체·안전거리 관련 현장 자료 확보",
        ],
      },
      gongbuhoResolution: {
        via: "news-fixture",
        code: "CONSTRUCTION_INJURY_COMPENSATION",
        version: "hani-20260618",
      },
    });

    expect(result.graph.graphVersion).toBe("9-D.1");
    expect(result.graph.claims.length).toBeGreaterThanOrEqual(5);
    expect(result.graph.claims.some((claim) => claim.text.includes("사지마비"))).toBe(true);
    expect(result.graph.claims.some((claim) => claim.text.includes("9억4000"))).toBe(true);
    expect(result.radar.radarVersion).toBe("9-E.1");
    expect(result.ledgerValidationPassed).toBe(true);
  });
});
