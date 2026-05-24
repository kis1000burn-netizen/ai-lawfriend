/**
 * Phase 13-E — opponent brief analyzer (baseline rule engine; LLM via prompts later).
 * 13-D 분석 결과 + page-level citation 기반 — 확정 법률 판단 없음.
 */
import type { DocumentAnalysisResult } from "./document-analysis.schema";
import { citationFromMatch } from "./document-analysis-citation";
import type { ExtractedPage } from "./document-extraction.schema";
import type { OpponentBriefEligibleDocumentType } from "./opponent-brief-analysis.schema";
import {
  OPPONENT_BRIEF_ANALYSIS_VERSION,
  type OpponentBriefAnalysisResult,
} from "./opponent-brief-analysis.schema";
import { validateOpponentBriefAnalysisResult } from "./opponent-brief-analysis-validator";

export const PHASE13E_OPPONENT_BRIEF_ANALYSIS_ENGINE_MARKER =
  "PHASE13E_OPPONENT_BRIEF_ANALYSIS_ENGINE" as const;

type AnalyzeOpponentBriefInput = {
  fileId: string;
  caseId: string;
  documentType: OpponentBriefEligibleDocumentType;
  pages: ExtractedPage[];
  originalFileName: string;
  priorAnalysis: DocumentAnalysisResult;
};

const ADMISSION_PATTERNS = [/인정(?:한다|함|하나)/, /사실(?:과\s*다름없|이\s*맞)/];
const DENIAL_PATTERNS = [
  /부인(?:한다|함)/,
  /다투(?:며|는)/,
  /아니(?:라|며)/,
  /인정할\s*수\s*없/,
];

const DEFENSE_PATTERNS: Array<{
  defenseKind: OpponentBriefAnalysisResult["defenses"][number]["defenseKind"];
  patterns: RegExp[];
  label: string;
}> = [
  {
    defenseKind: "REPAYMENT",
    patterns: [/변제/i, /이미\s*변제/, /상환/i, /변제\s*완료/],
    label: "변제 항변 후보",
  },
  {
    defenseKind: "STATUTE_OF_LIMITATIONS",
    patterns: [/소멸\s*시효/i, /시효/i, /시효\s*완성/],
    label: "소멸시효 항변 후보",
  },
  {
    defenseKind: "CONTRACT_NONEXISTENCE",
    patterns: [/계약\s*부존재/, /계약\s*없/, /약정\s*없/, /변제기\s*부존재/],
    label: "계약·약정 부존재 항변 후보",
  },
  {
    defenseKind: "FAULT_COMPARATIVE",
    patterns: [/과실\s*상계/, /과실\s*분담/, /상계/i],
    label: "과실상계 항변 후보",
  },
];

const NEW_ARGUMENT_PATTERNS = [
  /처음\s*주장/,
  /새로\s*주장/,
  /본\s*사건에서\s*처음/,
  /기존에\s*없/,
];

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。])\s+|[\n\r]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8);
}

function computeConfidence(base: number, text: string): number {
  let c = base;
  if (text.length < 15) c -= 0.15;
  if (text.length > 200) c -= 0.05;
  return Math.round(Math.max(0.35, Math.min(0.99, c)) * 100) / 100;
}

function dedupeByText<T extends { text: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.text.slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildOpponentPositionSummary(
  documentType: OpponentBriefEligibleDocumentType,
  priorAnalysis: DocumentAnalysisResult,
  pages: ExtractedPage[],
): OpponentBriefAnalysisResult["opponentPositionSummary"] {
  const fullText = pages.map((p) => p.text).join("\n");
  const base = priorAnalysis.summary;

  if (documentType === "OPPONENT_ANSWER" && /투자금/.test(fullText)) {
    return {
      oneLine:
        "상대방 답변서로, 금전 수령 사실 인정 후보와 투자금 주장 후보가 추출되었습니다. (확정 판단 아님)",
      keyPoints: [
        ...base.keyPoints,
        "상대방 입장 요약 후보 — 변호사 검토 필요",
      ].slice(0, 5),
    };
  }

  if (documentType === "OPPONENT_PREPARATORY_BRIEF" || documentType === "OPPONENT_BRIEF") {
    return {
      oneLine:
        "상대방 준비서면으로, 반박·항변·새 주장 후보가 추출되었습니다. (확정 판단 아님)",
      keyPoints: base.keyPoints.length
        ? base.keyPoints
        : ["준비서면 대응 컨텍스트 후보 생성"],
    };
  }

  if (documentType === "OPPONENT_EVIDENCE_OPINION") {
    return {
      oneLine:
        "상대방 증거신청서·증거의견서로, 증거 관련 주장·반박 후보가 추출되었습니다.",
      keyPoints: base.keyPoints.length
        ? base.keyPoints
        : ["증거 관련 상대방 입장 후보"],
    };
  }

  return {
    oneLine: base.oneLine,
    keyPoints: base.keyPoints,
  };
}

function extractFromPriorAnalysis(priorAnalysis: DocumentAnalysisResult) {
  const admissions = priorAnalysis.claims
    .filter((c) => c.claimType === "PARTY_ADMISSION")
    .map((c) => ({
      text: c.text,
      confidence: c.confidence,
      citation: c.citation,
      reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
    }));

  const denials = priorAnalysis.claims
    .filter((c) => c.claimType === "PARTY_DENIAL")
    .map((c) => ({
      text: c.text,
      confidence: c.confidence,
      citation: c.citation,
      reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
    }));

  const newArguments = priorAnalysis.claims
    .filter((c) => c.claimType === "OPPONENT_ASSERTION")
    .map((c) => ({
      text: c.text,
      confidence: c.confidence,
      citation: c.citation,
      reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
    }));

  return { admissions, denials, newArguments };
}

export function analyzeOpponentBriefContent(
  input: AnalyzeOpponentBriefInput,
): OpponentBriefAnalysisResult {
  const { fileId, caseId, documentType, pages, priorAnalysis } = input;
  const fullText = pages.map((p) => p.text).join("\n");
  const sentences = splitSentences(fullText);

  const fromPrior = extractFromPriorAnalysis(priorAnalysis);

  const admissions = [...fromPrior.admissions];
  const denials = [...fromPrior.denials];
  const defenses: OpponentBriefAnalysisResult["defenses"] = [];
  const newArguments = [...fromPrior.newArguments];
  const contradictionCandidates: OpponentBriefAnalysisResult["contradictionCandidates"] =
    [];
  const rebuttalIssueCandidates: OpponentBriefAnalysisResult["rebuttalIssueCandidates"] =
    [];
  const clientConfirmationQuestions: OpponentBriefAnalysisResult["clientConfirmationQuestions"] =
    [];
  const evidenceRequests: OpponentBriefAnalysisResult["evidenceRequests"] = [];

  for (const sentence of sentences) {
    if (
      ADMISSION_PATTERNS.some((p) => p.test(sentence)) &&
      !admissions.some((a) => a.text.slice(0, 40) === sentence.slice(0, 40))
    ) {
      admissions.push({
        text: sentence.slice(0, 300),
        confidence: computeConfidence(0.88, sentence),
        citation: citationFromMatch(pages, sentence, "인정 표현 후보"),
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    }

    if (
      DENIAL_PATTERNS.some((p) => p.test(sentence)) &&
      !denials.some((d) => d.text.slice(0, 40) === sentence.slice(0, 40))
    ) {
      denials.push({
        text: sentence.slice(0, 300),
        confidence: computeConfidence(0.86, sentence),
        citation: citationFromMatch(pages, sentence, "부인·다투 표현 후보"),
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    }

    for (const { defenseKind, patterns, label } of DEFENSE_PATTERNS) {
      if (
        patterns.some((p) => p.test(sentence)) &&
        defenses.length < 12 &&
        !defenses.some((d) => d.text.slice(0, 40) === sentence.slice(0, 40))
      ) {
        defenses.push({
          defenseKind,
          text: sentence.slice(0, 300),
          confidence: computeConfidence(0.84, sentence),
          citation: citationFromMatch(pages, sentence, label),
          reviewStatus: "NEEDS_LAWYER_REVIEW",
        });
      }
    }

    if (
      NEW_ARGUMENT_PATTERNS.some((p) => p.test(sentence)) &&
      newArguments.length < 12
    ) {
      newArguments.push({
        text: sentence.slice(0, 300),
        confidence: computeConfidence(0.8, sentence),
        citation: citationFromMatch(pages, sentence, "새 주장 후보"),
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    }
  }

  if (/대여금/.test(fullText) && /투자금/.test(fullText)) {
    contradictionCandidates.push({
      text: "금전의 법적 성격(대여금 vs 투자금) 충돌 후보",
      conflictWith: "기존 의뢰인 진술·소장 주장과 상대방 주장 간 불일치 가능",
      confidence: 0.83,
      citation: citationFromMatch(
        pages,
        /투자금|대여금/.exec(fullText)?.[0] ?? "투자금",
        "상반된 금전 성격 표현",
      ),
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  for (const risk of priorAnalysis.riskSignals) {
    if (risk.riskType === "CASE_THEORY_CONFLICT_CANDIDATE" && risk.citation) {
      contradictionCandidates.push({
        text: risk.description,
        conflictWith: "사건기록·인터뷰·소장 주장과 충돌 후보",
        confidence: risk.confidence,
        citation: risk.citation,
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    }
  }

  for (const issue of priorAnalysis.legalIssueCandidates) {
    rebuttalIssueCandidates.push({
      text: `반박 필요 쟁점 후보: ${issue.text}`,
      confidence: issue.confidence,
      citation: issue.citation,
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  for (const denial of dedupeByText(denials).slice(0, 3)) {
    rebuttalIssueCandidates.push({
      text: `상대방 부인에 대한 반박 쟁점 후보: ${denial.text.slice(0, 120)}`,
      confidence: 0.78,
      citation: denial.citation,
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  if (/투자금/.test(fullText)) {
    clientConfirmationQuestions.push({
      text: "투자계약서 또는 투자 설명자료 존재 여부를 확인해 주세요. (확인 필요)",
      confidence: 0.82,
      citation: citationFromMatch(pages, "투자", "투자금 주장 관련 확인 질문 후보"),
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
    clientConfirmationQuestions.push({
      text: "대여 당시 이자·변제기 약정 여부를 확인해 주세요. (확인 필요)",
      confidence: 0.8,
      citation: citationFromMatch(
        pages,
        /변제|이자/.exec(fullText)?.[0] ?? "변제",
        "약정 관련 확인 질문 후보",
      ),
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  if (denials.length > 0) {
    clientConfirmationQuestions.push({
      text: `상대방이 부인한 사실(${denials[0]!.text.slice(0, 60)}…)에 대해 의뢰인 진술과 일치하는지 확인해 주세요.`,
      confidence: 0.79,
      citation: denials[0]!.citation,
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  if (contradictionCandidates.length > 0) {
    clientConfirmationQuestions.push({
      text: "기존 진술·소장 주장과 상대방 주장 간 차이를 의뢰인에게 확인해 주세요. (확인 필요)",
      confidence: 0.77,
      citation: contradictionCandidates[0]!.citation,
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  for (const ref of priorAnalysis.evidenceRefs.slice(0, 5)) {
    evidenceRequests.push({
      text: `${ref.label} 원본 또는 제출본 확보 요청 후보`,
      requestReason: "상대방 서면에서 언급된 증거",
      confidence: ref.confidence,
      citation: ref.citation,
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  if (/계좌|이체|입금/.test(fullText)) {
    evidenceRequests.push({
      text: "계좌이체 내역·거래명세 원본 요청 후보",
      requestReason: "금전 지급 경위 확인",
      confidence: 0.81,
      citation: citationFromMatch(pages, "계좌", "금전 거래 관련 증거 요청 후보"),
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  if (/문자|카카오|대화/.test(fullText)) {
    evidenceRequests.push({
      text: "문자·메신저 대화 원본 요청 후보",
      requestReason: "당시 합의·성격 관련 확인",
      confidence: 0.79,
      citation: citationFromMatch(pages, "대화", "의사소통 기록 증거 요청 후보"),
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  const responseIssues = rebuttalIssueCandidates
    .slice(0, 5)
    .map((r) => r.text.slice(0, 100));

  const requiredEvidence = evidenceRequests
    .slice(0, 5)
    .map((e) => e.text.slice(0, 80));

  const missingMaterials: string[] = [];
  if (/투자금/.test(fullText)) {
    missingMaterials.push("대여·투자 성격 관련 당시 자료");
  }
  if (denials.some((d) => /대여금/.test(d.text))) {
    missingMaterials.push("대여 당시 약정·차용증 관련 자료");
  }

  const draftContext: OpponentBriefAnalysisResult["draftContext"] = {
    responseIssueCandidates: responseIssues.length
      ? responseIssues
      : ["상대방 주장 대응 쟁점 후보 — 변호사 검토 필요"],
    requiredEvidenceCandidates: requiredEvidence.length
      ? requiredEvidence
      : ["추가 증거 확보 후보 — 변호사 검토 필요"],
    missingMaterialCandidates: missingMaterials,
    preparatoryBriefContextNote:
      "준비서면 초안 컨텍스트 후보입니다. 반박 구조·증거 보강은 변호사 검토 후 확정합니다.",
    reviewStatus: "NEEDS_LAWYER_REVIEW",
  };

  const opponentPositionSummary = buildOpponentPositionSummary(
    documentType,
    priorAnalysis,
    pages,
  );

  const result: OpponentBriefAnalysisResult = {
    version: OPPONENT_BRIEF_ANALYSIS_VERSION,
    fileId,
    caseId,
    analysisStatus: "AI_ANALYZED",
    documentType,
    opponentPositionSummary,
    admissions: dedupeByText(admissions),
    denials: dedupeByText(denials),
    defenses: dedupeByText(defenses),
    newArguments: dedupeByText(newArguments),
    contradictionCandidates: dedupeByText(contradictionCandidates),
    rebuttalIssueCandidates: dedupeByText(rebuttalIssueCandidates),
    clientConfirmationQuestions: dedupeByText(clientConfirmationQuestions),
    evidenceRequests: dedupeByText(evidenceRequests),
    draftContext,
  };

  void input.originalFileName;
  return validateOpponentBriefAnalysisResult(result);
}
