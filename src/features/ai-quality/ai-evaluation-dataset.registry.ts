/**
 * Product Phase 23-A — Golden evaluation samples SSOT (static catalog).
 */
import type { AiEvaluationDatasetEntryRecord } from "./ai-evaluation-dataset.schema";

export const AI_EVALUATION_DATASET_REGISTRY_MARKER_PHASE23A =
  "phase23a-ai-evaluation-dataset-registry" as const;

export const AI_EVALUATION_DATASET_SAMPLES: AiEvaluationDatasetEntryRecord[] = [
  {
    code: "EVAL-LOAN-CASE-SUMMARY-001",
    packType: "LOAN",
    feature: "CASE_SUMMARY",
    title: "대여금 반환 — 사건 요약 golden",
    inputContext: {
      caseType: "LOAN",
      factsSummary:
        "2024-01-10 5000만원 대여, 변제기 2024-06-30, 일부 변제 1000만원, 잔액 미변제.",
      interviewHighlights: ["차용증 존재", "변제기 도과"],
      locale: "ko-KR",
    },
    expectedCriteria: {
      mustMention: ["변제기", "잔액"],
      mustNotInvent: ["판결", "승소"],
      citationRequired: false,
      maxHallucinationRisk: "LOW",
    },
  },
  {
    code: "EVAL-LEASE-CASE-SUMMARY-001",
    packType: "LEASE",
    feature: "CASE_SUMMARY",
    title: "임대차 보증금 — 사건 요약 golden",
    inputContext: {
      caseType: "LEASE",
      factsSummary: "전세 보증금 2억, 계약 만료 후 반환 거부, 현재 점유 지속.",
      locale: "ko-KR",
    },
    expectedCriteria: {
      mustMention: ["보증금", "반환"],
      mustNotInvent: ["명도 완료"],
      citationRequired: false,
      maxHallucinationRisk: "LOW",
    },
  },
  {
    code: "EVAL-LABOR-DOCUMENT-PARAGRAPH-001",
    packType: "LABOR",
    feature: "DOCUMENT_PARAGRAPH",
    title: "임금 체불 — 문단 생성 golden",
    inputContext: {
      caseType: "LABOR",
      factsSummary: "3개월 임금 미지급, 근로계약서 및 출퇴근 기록 보유.",
      locale: "ko-KR",
    },
    expectedCriteria: {
      mustMention: ["임금", "근로"],
      mustNotInvent: ["승소 확정"],
      citationRequired: true,
      maxHallucinationRisk: "LOW",
    },
  },
  {
    code: "EVAL-CRIMINAL-CONTRADICTION-001",
    packType: "CRIMINAL",
    feature: "CONTRADICTION_RADAR",
    title: "형사 — 진술 모순 탐지 golden",
    inputContext: {
      caseType: "CRIMINAL",
      factsSummary: "1차 진술: 현장 부재 주장. 2차 진술: CCTV 확인 후 현장 존재 인정.",
      interviewHighlights: ["진술 변경"],
      locale: "ko-KR",
    },
    expectedCriteria: {
      mustMention: ["진술", "모순"],
      mustNotInvent: ["유죄 확정"],
      citationRequired: false,
      maxHallucinationRisk: "MEDIUM",
    },
  },
  {
    code: "EVAL-DIVORCE-INTELLIGENCE-GRAPH-001",
    packType: "DIVORCE",
    feature: "CASE_INTELLIGENCE_GRAPH",
    title: "이혼 — 사건 인텔리전스 그래프 golden",
    inputContext: {
      caseType: "DIVORCE",
      factsSummary: "협의이혼 실패, 재산분할·양육권 쟁점, 양육비 합의 없음.",
      locale: "ko-KR",
    },
    expectedCriteria: {
      mustMention: ["재산", "양육"],
      mustNotInvent: ["판결 선고"],
      citationRequired: false,
      maxHallucinationRisk: "LOW",
    },
  },
  {
    code: "EVAL-DAMAGES-JUDGMENT-LEDGER-001",
    packType: "DAMAGES",
    feature: "LAWYER_JUDGMENT_LEDGER",
    title: "손해배상 — 변호사 판단 원장 golden",
    inputContext: {
      caseType: "DAMAGES",
      factsSummary: "교통사고 손해배상, 과실 비율·치료비·휴업손해 쟁점.",
      locale: "ko-KR",
    },
    expectedCriteria: {
      mustMention: ["과실", "손해"],
      mustNotInvent: ["배상액 확정"],
      citationRequired: false,
      maxHallucinationRisk: "LOW",
    },
  },
];

export function getStaticAiEvaluationDatasetCatalog() {
  return AI_EVALUATION_DATASET_SAMPLES;
}

export function findStaticAiEvaluationEntryByCode(code: string) {
  return AI_EVALUATION_DATASET_SAMPLES.find((entry) => entry.code === code) ?? null;
}
