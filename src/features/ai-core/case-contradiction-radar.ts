/**
 * Phase 9-E — Contradiction Radar (5-axis signal detection, rule-based).
 * @see docs/ai/AIBEOPCHIN_CONTRADICTION_RADAR_SPEC.md
 *
 * 불변 원칙: AI는 판단하지 않는다 — 모순·누락·위험 신호만 구조화한다.
 */
import { z } from "zod";

import type { InterviewAnswerMap } from "@/features/question-set/question-set.types";
import { checkForbiddenAssertions } from "./ai-output-schema-validator";
import type { CaseIntelligenceClaim, CaseIntelligenceGraph } from "./case-intelligence-graph.schema";

export const PHASE9E_CONTRADICTION_RADAR_MARKER =
  "PHASE9E_CONTRADICTION_RADAR" as const;

export const CONTRADICTION_RADAR_VERSION = "9-E.1" as const;

/** Radar가 관찰하는 5축 provenance */
export const CONTRADICTION_RADAR_AXES = [
  "INTERVIEW",
  "ATTACHMENT",
  "GONGBUHO",
  "SUMMARY_CLAIM",
  "LAWYER_MEMO",
] as const;

export type ContradictionRadarAxis = (typeof CONTRADICTION_RADAR_AXES)[number];

export const CONTRADICTION_SIGNAL_TYPES = [
  "CROSS_AXIS_MISMATCH",
  "MISSING_EVIDENCE",
  "RISKY_ASSERTION",
  "UNREVIEWED_CRITICAL_ISSUE",
  "CONTRADICTING_CLAIMS",
] as const;

export type ContradictionSignalType = (typeof CONTRADICTION_SIGNAL_TYPES)[number];

export const CONTRADICTION_SEVERITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type ContradictionSeverity = (typeof CONTRADICTION_SEVERITIES)[number];

export const caseContradictionSignalSchema = z.object({
  signalId: z.string().min(1),
  signalType: z.enum(CONTRADICTION_SIGNAL_TYPES),
  severity: z.enum(CONTRADICTION_SEVERITIES),
  axes: z.array(z.enum(CONTRADICTION_RADAR_AXES)).min(1),
  claimIds: z.array(z.string()).optional(),
  sourceRefs: z.array(z.string()).optional(),
  message: z.string().min(1).max(1000),
  /** 변호사 검토 큐용 — AI 판단 아님 */
  requiresLawyerReview: z.boolean().default(true),
});

export type CaseContradictionSignal = z.infer<typeof caseContradictionSignalSchema>;

export const caseContradictionRadarResultSchema = z.object({
  radarVersion: z.literal(CONTRADICTION_RADAR_VERSION),
  scannedAt: z.string().datetime(),
  signalCount: z.number().int().nonnegative(),
  signals: z.array(caseContradictionSignalSchema),
  /** Graph `contradictions[]` edge projection */
  contradictions: z.array(
    z.object({
      claimIdA: z.string(),
      claimIdB: z.string(),
      reason: z.string().max(500),
    }),
  ),
});

export type CaseContradictionRadarResult = z.infer<typeof caseContradictionRadarResultSchema>;

export type CaseContradictionRadarAttachment = {
  id: string;
  filename: string;
  category?: string | null;
};

export type CaseContradictionRadarGongbuho = {
  ref: string;
  code?: string;
  version?: string;
};

export type CaseContradictionRadarLawyerMemo = {
  memoId: string;
  text: string;
};

export type CaseContradictionRadarInput = {
  caseId: string;
  scannedAt: string;
  interviewAnswers: InterviewAnswerMap;
  attachments?: CaseContradictionRadarAttachment[];
  gongbuho?: CaseContradictionRadarGongbuho;
  claims: CaseIntelligenceClaim[];
  lawyerMemos?: CaseContradictionRadarLawyerMemo[];
};

const NEGATION_PAIRS: Array<[RegExp, RegExp]> = [
  [/지급받지\s*못|미지급|체불/, /지급(?:받|했|함)|지급\s*완료/],
  [/없(?:다|음|었)/, /있(?:다|음|었)/],
  [/아니(?:오|요|다)/, /(?:예|맞(?:다|음|습니다))/],
];

function claimPolarity(text: string): "negative" | "positive" | "neutral" {
  for (const [neg] of NEGATION_PAIRS) {
    if (neg.test(text)) return "negative";
  }
  for (const [, pos] of NEGATION_PAIRS) {
    if (pos.test(text)) return "positive";
  }
  return "neutral";
}

function extractYearMonth(text: string): string[] {
  const matches = text.match(/\d{4}\s*년\s*\d{1,2}\s*월/g) ?? [];
  return matches.map((m) => m.replace(/\s+/g, ""));
}

function nextSignalId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

function detectUnreviewedCriticalIssues(
  claims: CaseIntelligenceClaim[],
  signals: CaseContradictionSignal[],
  startIndex: number,
): number {
  let index = startIndex;
  for (const claim of claims) {
    const isCritical =
      claim.claimType === "USER_CLAIM" &&
      (claim.outputSectionKey === "issue_summary" ||
        claim.outputSectionKey === "fact_summary" ||
        claim.confidence === "HIGH");

    if (isCritical && claim.lawyerReviewState === "NOT_REVIEWED") {
      signals.push({
        signalId: nextSignalId("sig-unreviewed", index++),
        signalType: "UNREVIEWED_CRITICAL_ISSUE",
        severity: claim.confidence === "HIGH" ? "HIGH" : "MEDIUM",
        axes: ["SUMMARY_CLAIM"],
        claimIds: [claim.claimId],
        message: `검토되지 않은 핵심 Claim: ${claim.text.slice(0, 120)}`,
        requiresLawyerReview: true,
      });
    }
  }
  return index;
}

function detectRiskyAssertions(
  claims: CaseIntelligenceClaim[],
  signals: CaseContradictionSignal[],
  startIndex: number,
): number {
  let index = startIndex;
  for (const claim of claims) {
    const guardrail = checkForbiddenAssertions(claim.text);
    const hasHighConfidenceClaim =
      claim.claimType === "USER_CLAIM" &&
      claim.confidence === "HIGH" &&
      !/주장|진술/.test(claim.text);

    if (!guardrail.passed || hasHighConfidenceClaim) {
      signals.push({
        signalId: nextSignalId("sig-risky", index++),
        signalType: "RISKY_ASSERTION",
        severity: guardrail.passed ? "MEDIUM" : "HIGH",
        axes: ["SUMMARY_CLAIM"],
        claimIds: [claim.claimId],
        message: guardrail.passed
          ? `HIGH confidence USER_CLAIM without non-judgment framing: ${claim.claimId}`
          : `Forbidden assertion pattern in claim: ${claim.claimId}`,
        requiresLawyerReview: true,
      });
    }
  }
  return index;
}

function detectMissingEvidence(
  input: CaseContradictionRadarInput,
  signals: CaseContradictionSignal[],
  startIndex: number,
): number {
  let index = startIndex;
  const evidenceAnswer = String(input.interviewAnswers.evidence_summary ?? "").trim();
  const attachmentCount = input.attachments?.length ?? 0;

  if (evidenceAnswer && attachmentCount === 0) {
    signals.push({
      signalId: nextSignalId("sig-missing", index++),
      signalType: "MISSING_EVIDENCE",
      severity: "MEDIUM",
      axes: ["INTERVIEW", "ATTACHMENT"],
      sourceRefs: ["InterviewAnswer.evidence_summary"],
      message:
        "인터뷰 증거 요약은 있으나 등록된 첨부자료 메타가 없습니다.",
      requiresLawyerReview: true,
    });
  }

  if (input.gongbuho?.ref) {
    const hasGongbuhoSource = input.claims.some((claim) =>
      claim.sources.some((s) => s.kind === "GONGBUHO_PACKET" || s.kind === "GONGBUHO_TRACE"),
    );
    if (!hasGongbuhoSource) {
      signals.push({
        signalId: nextSignalId("sig-missing", index++),
        signalType: "MISSING_EVIDENCE",
        severity: "LOW",
        axes: ["GONGBUHO", "SUMMARY_CLAIM"],
        sourceRefs: [input.gongbuho.ref],
        message: `공부호 패킷(${input.gongbuho.ref})이 있으나 Claim 출처에 연결되지 않았습니다.`,
        requiresLawyerReview: true,
      });
    }
  }

  for (const claim of input.claims) {
    const mentionsAttachment = /첨부|서류|계약서|영수증/.test(claim.text);
    const hasAttachmentSource = claim.sources.some((s) => s.kind === "ATTACHMENT_META");
    if (mentionsAttachment && !hasAttachmentSource) {
      signals.push({
        signalId: nextSignalId("sig-missing", index++),
        signalType: "MISSING_EVIDENCE",
        severity: "MEDIUM",
        axes: ["SUMMARY_CLAIM", "ATTACHMENT"],
        claimIds: [claim.claimId],
        message: `Claim ${claim.claimId} references documents but lacks ATTACHMENT_META source.`,
        requiresLawyerReview: true,
      });
    }
  }

  return index;
}

function detectCrossAxisMismatch(
  input: CaseContradictionRadarInput,
  signals: CaseContradictionSignal[],
  startIndex: number,
): number {
  let index = startIndex;
  const interviewDates = extractYearMonth(
    Object.values(input.interviewAnswers)
      .map((v) => String(v ?? ""))
      .join(" "),
  );

  for (const claim of input.claims) {
    const claimDates = extractYearMonth(claim.text);
    if (interviewDates.length && claimDates.length) {
      const mismatch = claimDates.some((d) => !interviewDates.includes(d));
      if (mismatch) {
        signals.push({
          signalId: nextSignalId("sig-mismatch", index++),
          signalType: "CROSS_AXIS_MISMATCH",
          severity: "MEDIUM",
          axes: ["INTERVIEW", "SUMMARY_CLAIM"],
          claimIds: [claim.claimId],
          message: `Claim 날짜 표현이 인터뷰 답변과 일치하지 않을 수 있습니다: ${claim.claimId}`,
          requiresLawyerReview: true,
        });
      }
    }
  }

  for (const memo of input.lawyerMemos ?? []) {
    for (const claim of input.claims) {
      if (claim.claimType !== "USER_CLAIM") continue;
      const claimPol = claimPolarity(claim.text);
      const memoPol = claimPolarity(memo.text);
      if (claimPol !== "neutral" && memoPol !== "neutral" && claimPol !== memoPol) {
        signals.push({
          signalId: nextSignalId("sig-mismatch", index++),
          signalType: "CROSS_AXIS_MISMATCH",
          severity: "HIGH",
          axes: ["SUMMARY_CLAIM", "LAWYER_MEMO"],
          claimIds: [claim.claimId],
          sourceRefs: [`LawyerMemo.${memo.memoId}`],
          message: `변호사 메모와 Claim ${claim.claimId}의 진술 방향이 다를 수 있습니다.`,
          requiresLawyerReview: true,
        });
      }
    }
  }

  return index;
}

function detectContradictingClaims(
  claims: CaseIntelligenceClaim[],
  signals: CaseContradictionSignal[],
  contradictions: CaseContradictionRadarResult["contradictions"],
  startIndex: number,
): number {
  let index = startIndex;

  for (let i = 0; i < claims.length; i++) {
    for (let j = i + 1; j < claims.length; j++) {
      const a = claims[i];
      const b = claims[j];
      if (!a || !b) continue;

      const polA = claimPolarity(a.text);
      const polB = claimPolarity(b.text);
      if (polA === "neutral" || polB === "neutral" || polA === polB) continue;

      const sharedTopic =
        /임금|지급|계약|손해|사기|대금/.test(a.text) && /임금|지급|계약|손해|사기|대금/.test(b.text);
      if (!sharedTopic) continue;

      const reason = `상반된 진술 가능성: ${a.claimId} ↔ ${b.claimId}`;
      contradictions.push({ claimIdA: a.claimId, claimIdB: b.claimId, reason });
      signals.push({
        signalId: nextSignalId("sig-contradict", index++),
        signalType: "CONTRADICTING_CLAIMS",
        severity: "HIGH",
        axes: ["SUMMARY_CLAIM"],
        claimIds: [a.claimId, b.claimId],
        message: reason,
        requiresLawyerReview: true,
      });
    }
  }

  return index;
}

export function scanCaseContradictionRadar(
  input: CaseContradictionRadarInput,
): CaseContradictionRadarResult {
  const signals: CaseContradictionSignal[] = [];
  const contradictions: CaseContradictionRadarResult["contradictions"] = [];

  let index = 0;
  index = detectUnreviewedCriticalIssues(input.claims, signals, index);
  index = detectRiskyAssertions(input.claims, signals, index);
  index = detectMissingEvidence(input, signals, index);
  index = detectCrossAxisMismatch(input, signals, index);
  index = detectContradictingClaims(input.claims, signals, contradictions, index);

  const parsedSignals = signals.map((s) => caseContradictionSignalSchema.parse(s));

  return caseContradictionRadarResultSchema.parse({
    radarVersion: CONTRADICTION_RADAR_VERSION,
    scannedAt: input.scannedAt,
    signalCount: parsedSignals.length,
    signals: parsedSignals,
    contradictions,
  });
}

export function attachRadarToGraph(
  graph: CaseIntelligenceGraph,
  radar: CaseContradictionRadarResult,
): CaseIntelligenceGraph {
  return {
    ...graph,
    contradictions: radar.contradictions.length ? radar.contradictions : graph.contradictions,
  };
}
