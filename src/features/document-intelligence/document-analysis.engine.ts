/**
 * Phase 13-D — rule-based document content analyzer (baseline; LLM via prompts later).
 * Structures content into candidates with citations — no final legal judgment.
 */
import type { LitigationDocumentType } from "./document-intelligence-engine.schema";
import type { ExtractedPage } from "./document-extraction.schema";
import {
  DOCUMENT_INTELLIGENCE_ANALYSIS_VERSION,
  type DocumentAnalysisResult,
} from "./document-analysis.schema";
import { citationFromMatch } from "./document-analysis-citation";
import { validateDocumentAnalysisResult } from "./document-analysis-validator";

export const PHASE13D_DOCUMENT_ANALYSIS_ENGINE_MARKER =
  "PHASE13D_DOCUMENT_ANALYSIS_ENGINE" as const;

type AnalyzeInput = {
  fileId: string;
  caseId: string;
  documentType: LitigationDocumentType;
  pages: ExtractedPage[];
  originalFileName: string;
};

const EVIDENCE_REF_PATTERN =
  /([갑을]\s*제?\s*\d+\s*호증|[갑을]\s*\d+\s*호증)/g;

const DEADLINE_CANDIDATE_PATTERNS = [
  /(\d+\s*일\s*이내)/,
  /(송달일로부터\s*\d+\s*일)/,
  /(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?)/,
  /(\d{4}년\s*\d{1,2}월\s*\d{1,2}일)/,
];

const ADMISSION_PATTERNS = [/인정(?:한다|함|하나)/, /사실(?:과\s*다름없|이\s*맞)/];
const DENIAL_PATTERNS = [
  /부인(?:한다|함)/,
  /다투(?:며|는)/,
  /아니(?:라|며)/,
  /인정할\s*수\s*없/,
];

const ASSERTION_PATTERNS = [
  /(?:주장|assert)(?:하|함|한다)/i,
  /(?:라|다)고\s*주장/,
  /해당\s*금원/,
  /투자금/,
  /대여금/,
];

const REQUEST_PATTERNS = [
  { kind: "COURT_ORDER" as const, re: /보정(?:하|할)\s*(?:것|라)/ },
  { kind: "COURT_ORDER" as const, re: /제출(?:하|할)\s*(?:것|라)/ },
  { kind: "COURT_ORDER" as const, re: /석명(?:하|할)\s*(?:것|라)/ },
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

function buildSummary(
  documentType: LitigationDocumentType,
  pages: ExtractedPage[],
  claims: DocumentAnalysisResult["claims"],
): DocumentAnalysisResult["summary"] {
  const fullText = pages.map((p) => p.text).join("\n").slice(0, 4000);

  if (documentType === "OPPONENT_ANSWER") {
    const hasInvestment = /투자금/.test(fullText);
    const hasLoan = /대여금/.test(fullText);
    const admitsReceipt = /금전|금원|수령|지급/.test(fullText) && ADMISSION_PATTERNS.some((p) => p.test(fullText));

    let oneLine =
      "상대방 제출 서면으로, 문서 본문에서 주장·인정·부인 후보가 추출되었습니다.";
    if (admitsReceipt && hasInvestment) {
      oneLine =
        "피고는 금전 수령 사실은 인정하나 대여금이 아닌 투자금이라고 주장합니다.";
    } else if (claims[0]?.text) {
      oneLine = `문서에서 추출된 핵심 주장 후보: ${claims[0].text.slice(0, 80)}`;
    }

    const keyPoints: string[] = [];
    if (admitsReceipt) keyPoints.push("금전 수령 사실 인정 후보");
    if (hasLoan && DENIAL_PATTERNS.some((p) => p.test(fullText))) {
      keyPoints.push("대여금 성격 부인 후보");
    }
    if (hasInvestment) keyPoints.push("투자금 주장 후보");
    if (keyPoints.length === 0 && claims.length > 0) {
      keyPoints.push(...claims.slice(0, 3).map((c) => c.text.slice(0, 60)));
    }

    return { oneLine, keyPoints: keyPoints.slice(0, 5) };
  }

  const firstPage = pages.find((p) => p.text.trim())?.text.slice(0, 150) ?? "";
  return {
    oneLine: firstPage
      ? `${documentType} 문서 — ${firstPage.slice(0, 100)}…`
      : `${documentType} 문서 분석 후보가 생성되었습니다.`,
    keyPoints: claims.slice(0, 3).map((c) => c.text.slice(0, 80)),
  };
}

export function analyzeLitigationDocumentContent(
  input: AnalyzeInput,
): DocumentAnalysisResult {
  const { fileId, caseId, documentType, pages, originalFileName } = input;
  const fullText = pages.map((p) => p.text).join("\n");
  const sentences = splitSentences(fullText);

  const claims: DocumentAnalysisResult["claims"] = [];
  const facts: DocumentAnalysisResult["facts"] = [];
  const requests: DocumentAnalysisResult["requests"] = [];
  const evidenceRefs: DocumentAnalysisResult["evidenceRefs"] = [];
  const deadlineCandidates: DocumentAnalysisResult["deadlineCandidates"] = [];
  const legalIssueCandidates: DocumentAnalysisResult["legalIssueCandidates"] = [];
  const riskSignals: DocumentAnalysisResult["riskSignals"] = [];

  for (const sentence of sentences) {
    if (ADMISSION_PATTERNS.some((p) => p.test(sentence))) {
      claims.push({
        claimType: "PARTY_ADMISSION",
        text: sentence.slice(0, 300),
        confidence: computeConfidence(0.88, sentence),
        citation: citationFromMatch(pages, sentence, "인정 표현 후보"),
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    } else if (DENIAL_PATTERNS.some((p) => p.test(sentence))) {
      claims.push({
        claimType: "PARTY_DENIAL",
        text: sentence.slice(0, 300),
        confidence: computeConfidence(0.86, sentence),
        citation: citationFromMatch(pages, sentence, "부인·다툼 표현 후보"),
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    } else if (ASSERTION_PATTERNS.some((p) => p.test(sentence))) {
      const claimType = documentType.startsWith("OPPONENT_")
        ? "OPPONENT_ASSERTION"
        : documentType.startsWith("COURT_")
          ? "COURT_ORDER"
          : "OTHER";

      if (claims.length < 12) {
        claims.push({
          claimType,
          text: sentence.slice(0, 300),
          confidence: computeConfidence(0.82, sentence),
          citation: citationFromMatch(pages, sentence, "주장 후보 문장"),
          reviewStatus: "NEEDS_LAWYER_REVIEW",
        });
      }
    }

    if (/^\d{4}/.test(sentence) || /금액|원|\d{1,3},\d{3}/.test(sentence)) {
      if (facts.length < 10) {
        facts.push({
          text: sentence.slice(0, 300),
          confidence: computeConfidence(0.75, sentence),
          citation: citationFromMatch(pages, sentence, "사실관계 후보"),
          reviewStatus: "NEEDS_LAWYER_REVIEW",
        });
      }
    }

    for (const { kind, re } of REQUEST_PATTERNS) {
      if (re.test(sentence) && requests.length < 8) {
        requests.push({
          requestKind: kind,
          text: sentence.slice(0, 300),
          confidence: computeConfidence(0.9, sentence),
          citation: citationFromMatch(pages, sentence, "요구·명령 후보"),
          reviewStatus: "NEEDS_LAWYER_REVIEW",
        });
      }
    }
  }

  for (const page of pages) {
    const matches = page.text.matchAll(EVIDENCE_REF_PATTERN);
    for (const m of matches) {
      if (evidenceRefs.length >= 20) break;
      const label = m[1] ?? m[0];
      evidenceRefs.push({
        label,
        description: "문서 내 증거 번호 언급 후보",
        confidence: 0.92,
        citation: citationFromMatch(pages, label, "증거 번호 언급"),
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    }
  }

  for (const page of pages) {
    for (const pattern of DEADLINE_CANDIDATE_PATTERNS) {
      const m = page.text.match(pattern);
      if (m && deadlineCandidates.length < 10) {
        deadlineCandidates.push({
          text: m[0],
          candidateRule: m[0],
          confidence: 0.78,
          citation: citationFromMatch(pages, m[0], "기한 후보 표현 (확정 계산 아님)"),
          reviewStatus: "NEEDS_LAWYER_REVIEW",
        });
      }
    }
  }

  if (/대여금/.test(fullText) && /투자금/.test(fullText)) {
    legalIssueCandidates.push({
      text: "금전의 법적 성격(대여금 vs 투자금) 쟁점 후보",
      confidence: 0.85,
      citation: citationFromMatch(
        pages,
        /투자금|대여금/.exec(fullText)?.[0] ?? "투자금",
        "상반된 금전 성격 표현",
      ),
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  if (documentType === "OPPONENT_ANSWER" && /투자금/.test(fullText)) {
    riskSignals.push({
      riskType: "CASE_THEORY_CONFLICT_CANDIDATE",
      description:
        "기존 의뢰인 진술의 대여금 주장과 충돌 가능성이 있습니다. (사건기록 대조는 13-F)",
      confidence: 0.81,
      citation: citationFromMatch(pages, "투자금", "상대방 투자금 주장 후보"),
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  if (deadlineCandidates.length > 0) {
    riskSignals.push({
      riskType: "DEADLINE_ATTENTION_CANDIDATE",
      description: "문서에서 기한 후보 표현이 감지되었습니다. 변호사 확인이 필요합니다.",
      confidence: 0.8,
      citation: deadlineCandidates[0]!.citation,
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  if (claims.length === 0 && fullText.trim()) {
    const first = sentences[0] ?? fullText.slice(0, 200);
    claims.push({
      claimType: documentType.startsWith("OPPONENT_")
        ? "OPPONENT_ASSERTION"
        : "OTHER",
      text: first.slice(0, 300),
      confidence: 0.65,
      citation: citationFromMatch(pages, first, "대표 문장 기반 주장 후보"),
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  const summary = buildSummary(documentType, pages, claims);

  const result: DocumentAnalysisResult = {
    version: DOCUMENT_INTELLIGENCE_ANALYSIS_VERSION,
    fileId,
    caseId,
    analysisStatus: "AI_ANALYZED",
    documentType,
    summary,
    claims: dedupeClaims(claims),
    facts: dedupeByText(facts),
    requests: dedupeByText(requests),
    evidenceRefs: dedupeEvidence(evidenceRefs),
    deadlineCandidates: dedupeByText(deadlineCandidates),
    legalIssueCandidates: dedupeByText(legalIssueCandidates),
    riskSignals,
  };

  void originalFileName;
  return validateDocumentAnalysisResult(result);
}

function dedupeClaims(items: DocumentAnalysisResult["claims"]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.text.slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeEvidence(items: DocumentAnalysisResult["evidenceRefs"]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  });
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
