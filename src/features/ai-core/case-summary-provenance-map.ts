/**
 * Phase 9-D — Case Summary provenance mapping (Output Spec §6 ↔ API ↔ Graph claims).
 * @see docs/ai/AIBEOPCHIN_CASE_INTELLIGENCE_GRAPH_SPEC.md
 */
import type { InterviewAnswerMap } from "@/features/question-set/question-set.types";
import type { CaseIntelligenceClaim, EvidenceRef } from "./case-intelligence-graph.schema";
import {
  CASE_INTELLIGENCE_GRAPH_VERSION,
  type CaseClaimType,
  type ConfidenceLevel,
} from "./case-intelligence-graph.schema";

export const CASE_SUMMARY_PROVENANCE_MAP_MARKER =
  "PHASE9D_CASE_SUMMARY_PROVENANCE_MAP" as const;

/** CASE_SUMMARY_OUTPUT_SPEC §6 → API `summary.content` field */
export const CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD = {
  case_overview: "caseOverview",
  fact_summary: "timeline",
  issue_summary: "issues",
  status_summary: "caseStatus",
  next_step: "checklist",
  risk_or_missing_info: "riskNotes",
  request_summary: "issues",
} as const;

export type CaseSummaryOutputSectionKey = keyof typeof CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD;

const INTERVIEW_KEY_TO_CLAIM: Record<
  string,
  { claimType: CaseClaimType; confidence: ConfidenceLevel; section: CaseSummaryOutputSectionKey }
> = {
  case_background: { claimType: "USER_STATEMENT", confidence: "MEDIUM", section: "case_overview" },
  current_status: { claimType: "USER_STATEMENT", confidence: "MEDIUM", section: "fact_summary" },
  desired_result: { claimType: "USER_CLAIM", confidence: "MEDIUM", section: "request_summary" },
  civil_damage_or_claim: {
    claimType: "USER_CLAIM",
    confidence: "MEDIUM",
    section: "issue_summary",
  },
  criminal_allegation: {
    claimType: "USER_CLAIM",
    confidence: "MEDIUM",
    section: "issue_summary",
  },
  evidence_summary: {
    claimType: "USER_STATEMENT",
    confidence: "LOW",
    section: "fact_summary",
  },
  people_involved: {
    claimType: "USER_STATEMENT",
    confidence: "MEDIUM",
    section: "case_overview",
  },
};

function formatAnswer(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function interviewSource(questionKey: string, answerText: string): EvidenceRef {
  return {
    kind: "INTERVIEW_ANSWER",
    ref: `InterviewAnswer.${questionKey}`,
    label: questionKey,
    excerpt: answerText.slice(0, 500),
  };
}

export function buildInterviewAnswerClaims(input: {
  caseId: string;
  answers: InterviewAnswerMap;
  gongbuhoLegalBasisRef?: string;
}): CaseIntelligenceClaim[] {
  const claims: CaseIntelligenceClaim[] = [];
  let index = 0;

  for (const [questionKey, raw] of Object.entries(input.answers)) {
    const text = formatAnswer(raw).trim();
    if (!text) continue;

    const meta = INTERVIEW_KEY_TO_CLAIM[questionKey] ?? {
      claimType: "USER_STATEMENT" as const,
      confidence: "LOW" as const,
      section: "fact_summary" as const,
    };

    const claimId = `claim-interview-${questionKey}-${index++}`;
    const displayText =
      meta.claimType === "USER_CLAIM"
        ? `의뢰인은 「${text}」라고 주장합니다.`
        : text;

    claims.push({
      claimId,
      text: displayText,
      claimType: meta.claimType,
      sources: [interviewSource(questionKey, text)],
      legalBasis: input.gongbuhoLegalBasisRef
        ? [{ ref: input.gongbuhoLegalBasisRef }]
        : undefined,
      confidence: meta.confidence,
      lawyerReviewState: "NOT_REVIEWED",
      clientVisible: false,
      audience: "INTERNAL",
      outputSectionKey: meta.section,
      apiFieldHint: CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD[meta.section],
    });
  }

  return claims;
}

/** Phase 9-D 예시 — 임금 체부 주장 (Spec §3) */
export function buildWageBackpayExampleClaim(): CaseIntelligenceClaim {
  return {
    claimId: "claim-example-wage-03",
    text: "근로자는 2025년 3월부터 임금을 지급받지 못했다고 주장합니다.",
    claimType: "USER_CLAIM",
    sources: [
      {
        kind: "INTERVIEW_ANSWER",
        ref: "InterviewAnswer.Q_WAGE_03",
        excerpt: "2025년 3월부터 임금 미지급",
      },
    ],
    legalBasis: [{ ref: "GongbuhoPacket.WAGE_BACKPAY", code: "WAGE", version: "1.0.0" }],
    confidence: "MEDIUM",
    lawyerReviewState: "NOT_REVIEWED",
    clientVisible: false,
    audience: "INTERNAL",
    outputSectionKey: "fact_summary",
    apiFieldHint: "timeline",
  };
}

export function buildCaseIntelligenceGraphDraft(input: {
  caseId: string;
  generatedAt: string;
  caseSummaryAiMode: string;
  answers: InterviewAnswerMap;
  gongbuhoLegalBasisRef?: string;
}): {
  graphVersion: typeof CASE_INTELLIGENCE_GRAPH_VERSION;
  caseId: string;
  generatedAt: string;
  summaryOperation: "CASE_SUMMARY_GENERATE";
  caseSummaryAiMode: string;
  claims: CaseIntelligenceClaim[];
} {
  return {
    graphVersion: CASE_INTELLIGENCE_GRAPH_VERSION,
    caseId: input.caseId,
    generatedAt: input.generatedAt,
    summaryOperation: "CASE_SUMMARY_GENERATE",
    caseSummaryAiMode: input.caseSummaryAiMode,
    claims: buildInterviewAnswerClaims(input),
  };
}
