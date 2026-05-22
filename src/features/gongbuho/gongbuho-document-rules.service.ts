import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { GongbuhoSummaryResolution } from "@/features/gongbuho/gongbuho-summary-contract.service";
import { resolveGongbuhoPacketJsonForCaseSummary } from "@/features/gongbuho/gongbuho-summary-contract.service";

export type GongbuhoDocumentRulesResolvedSource = GongbuhoSummaryResolution;

function readPacketRoot(packetJson: unknown): Record<string, unknown> | null {
  if (typeof packetJson !== "object" || packetJson === null || Array.isArray(packetJson)) {
    return null;
  }
  return packetJson as Record<string, unknown>;
}

/** 패킷 `validationRules` / `forbiddenRules` / 루트 `expertReviewPoints` 문자열 배열 안전 로드 */
export function extractGongbuhoRuleStringArrays(packetJson: unknown): {
  validationRules: string[];
  forbiddenRules: string[];
  expertReviewPoints: string[];
} {
  const root = readPacketRoot(packetJson);
  if (!root) {
    return { validationRules: [], forbiddenRules: [], expertReviewPoints: [] };
  }

  const asLines = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((s) => s.trim());
  };

  return {
    validationRules: asLines(root.validationRules),
    forbiddenRules: asLines(root.forbiddenRules),
    expertReviewPoints: asLines(root.expertReviewPoints),
  };
}

function extractQuotedTriggers(rule: string): string[] {
  const triggers: string[] = [];
  for (const match of rule.matchAll(/\u201c([^\u201d]+)\u201d/g)) {
    if (match[1]?.trim()) triggers.push(match[1].trim());
  }
  for (const match of rule.matchAll(/\u2018([^\u2019]+)\u2019/g)) {
    if (match[1]?.trim()) triggers.push(match[1].trim());
  }
  for (const match of rule.matchAll(/[''"]([^'"]+)[''"]/g)) {
    if (match[1]?.trim()) triggers.push(match[1].trim());
  }
  return triggers;
}

/**
 * 규칙 문장에서 본문과 비교할 트리거 문자열 후보.
 * 인용구 우선 · 없으면 5글자 이상 한글 연속 부분 일부만 사용(탐지·표시 위해 과검 허용).
 */
export function forbiddenRuleTriggerCandidates(rule: string): string[] {
  const trimmed = rule.trim();
  if (!trimmed) return [];

  const quoted = extractQuotedTriggers(trimmed);
  if (quoted.length > 0) return quoted.map((x) => x.trim()).filter(Boolean);

  const chunks = trimmed.match(/[가-힣]{5,}/g) ?? [];
  const sorted = [...new Set(chunks)].sort((a, b) => b.length - a.length);
  return sorted.slice(0, 5);
}

export type GongbuhoForbiddenHit = {
  ruleIndex: number;
  ruleText: string;
  matchedTrigger?: string | null;
  note?: string;
};

export type GongbuhoRiskFlag =
  | {
      kind: "GONGBUHO_FORBIDDEN_CANDIDATE";
      ruleIndex: number;
      ruleText: string;
      matchedTrigger?: string | null;
    }
  | {
      kind: "GONGBUHO_VALIDATION_RULE_ITEM";
      ruleIndex: number;
      ruleText: string;
    }
  | {
      kind: "GONGBUHO_EXPERT_REVIEW_POINT";
      pointIndex: number;
      text: string;
    };

export type GongbuhoValidationRuleItem = {
  ruleIndex: number;
  text: string;
  automatedStatus: "PENDING_LEGAL_REVIEW";
};

export type GongbuhoDocumentRulesEvaluation = {
  applied: boolean;
  gongbuhoResolution?: GongbuhoDocumentRulesResolvedSource;
  validationChecklist: GongbuhoValidationRuleItem[];
  forbiddenHits: GongbuhoForbiddenHit[];
  riskFlags: GongbuhoRiskFlag[];
  expertReviewPoints: string[];
};

export function buildGongbuhoDocumentRulesPromptAppendix(input: {
  validationRules: string[];
  forbiddenRules: string[];
}): string {
  const v = input.validationRules;
  const f = input.forbiddenRules;
  if (!v.length && !f.length) return "";

  const vb = v.length ? v.map((s, i) => `${i + 1}. ${s}`).join("\n") : "(없음)";
  const fb = f.length ? f.map((s, i) => `${i + 1}. ${s}`).join("\n") : "(없음)";

  return `
[공부호 패킷 · 검증·금지 규칙 참고]
공부호에 정의된 아래 규칙을 참고해 작성합니다. 결과는 최종 법률 문서가 아니며 금지 표현 및 단정 레이블을 피하십시오.

● validationRules (검토 체크리스트)
${vb}

● forbiddenRules (패킷 차단 또는 경고 기준 원문)
${fb}
`.trim();
}

/** 생성 본문에 대한 forbidden 규칙 트리거 탐지(교정 금지). */
export function evaluateGongbuhoDocumentRulesAgainstText(params: {
  generatedBody: string;
  validationRules: string[];
  forbiddenRules: string[];
  expertReviewPoints: string[];
}): Pick<
  GongbuhoDocumentRulesEvaluation,
  "validationChecklist" | "forbiddenHits" | "riskFlags" | "expertReviewPoints"
> {
  const { generatedBody, validationRules, forbiddenRules, expertReviewPoints } = params;

  const validationChecklist: GongbuhoValidationRuleItem[] = validationRules.map((text, i) => ({
    ruleIndex: i,
    text,
    automatedStatus: "PENDING_LEGAL_REVIEW",
  }));

  const forbiddenHits: GongbuhoForbiddenHit[] = [];

  /** expertReview 연계 플래그(변호사 검토 필요 항목 패킷 원문 연계 · 자동 처리 없음) */
  const riskFlags: GongbuhoRiskFlag[] = expertReviewPoints.map((text, pointIndex) => ({
    kind: "GONGBUHO_EXPERT_REVIEW_POINT" as const,
    pointIndex,
    text,
  }));

  forbiddenRules.forEach((ruleText, ruleIndex) => {
    const candidates = forbiddenRuleTriggerCandidates(ruleText);
    for (const trigger of candidates) {
      if (trigger.length > 0 && generatedBody.includes(trigger)) {
        forbiddenHits.push({
          ruleIndex,
          ruleText,
          matchedTrigger: trigger,
          note: "패킷 forbiddenRules 기준 문자열 포함 의심(자동 교정 안 함)",
        });

        riskFlags.push({
          kind: "GONGBUHO_FORBIDDEN_CANDIDATE",
          ruleIndex,
          ruleText,
          matchedTrigger: trigger,
        });

        break;
      }
    }
  });

  validationChecklist.forEach((item) => {
    riskFlags.push({
      kind: "GONGBUHO_VALIDATION_RULE_ITEM",
      ruleIndex: item.ruleIndex,
      ruleText: item.text,
    });
  });

  return {
    validationChecklist,
    forbiddenHits,
    riskFlags,
    expertReviewPoints,
  };
}

export type GongbuhoDocumentRulesLoadPrepared = {
  resolution: GongbuhoDocumentRulesResolvedSource | null;
  validationRules: string[];
  forbiddenRules: string[];
  expertReviewPoints: string[];
  promptAppendix: string;
};

/** 문서 초안 호출 시작 시: 패킷 조회 후 프롬프트 appendix·평가용 배열 준비 */
export async function prepareGongbuhoDocumentRulesForCase(
  caseId: string,
): Promise<GongbuhoDocumentRulesLoadPrepared | null> {
  const resolved = await resolveGongbuhoPacketJsonForCaseSummary(caseId);
  if (!resolved?.packetJson) return null;

  const extracted = extractGongbuhoRuleStringArrays(resolved.packetJson);

  const promptAppendix = buildGongbuhoDocumentRulesPromptAppendix({
    validationRules: extracted.validationRules,
    forbiddenRules: extracted.forbiddenRules,
  });

  return {
    resolution: resolved.resolution,
    validationRules: extracted.validationRules,
    forbiddenRules: extracted.forbiddenRules,
    expertReviewPoints: extracted.expertReviewPoints,
    promptAppendix,
  };
}

export function finalizeGongbuhoDocumentRulesEvaluation(
  generatedBody: string,
  prepared: GongbuhoDocumentRulesLoadPrepared | null,
): GongbuhoDocumentRulesEvaluation | null {
  if (!prepared || !prepared.resolution) return null;

  const part = evaluateGongbuhoDocumentRulesAgainstText({
    generatedBody,
    validationRules: prepared.validationRules,
    forbiddenRules: prepared.forbiddenRules,
    expertReviewPoints: prepared.expertReviewPoints,
  });

  return {
    applied: true,
    gongbuhoResolution: prepared.resolution,
    ...part,
  };
}

export type GongbuhoDocumentGenerationTraceAppend = {
  occurredAtIso: string;
  legalDocumentId: string;
  documentType: string;
  evaluation: GongbuhoDocumentRulesEvaluation;
};

export function fingerprintGongbuhoDocumentRulesEvaluation(
  evaluation: GongbuhoDocumentRulesEvaluation,
): string {
  const payload = {
    v: evaluation.validationChecklist.map((x) => x.text),
    f: evaluation.forbiddenHits.map((x) => ({
      t: x.ruleText,
      trig: x.matchedTrigger ?? null,
    })),
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function mergeLatestGongbuhoTraceDocumentGenerationResult(
  caseId: string,
  append: GongbuhoDocumentGenerationTraceAppend,
): Promise<void> {
  const latest = await prisma.gongbuhoTrace.findFirst({
    where: { caseId },
    orderBy: { createdAt: "desc" },
    select: { id: true, validationResult: true, riskFlags: true },
  });

  if (!latest) return;

  const vrPrev = latest.validationResult;
  const vrObj: Record<string, unknown> =
    typeof vrPrev === "object" && vrPrev !== null && !Array.isArray(vrPrev)
      ? { ...(vrPrev as Record<string, unknown>) }
      : {};

  const prior = vrObj.documentDraftGenerations;
  const list = Array.isArray(prior) ? [...prior] : [];
  list.push({
    occurredAtIso: append.occurredAtIso,
    legalDocumentId: append.legalDocumentId,
    documentType: append.documentType,
    evaluation: append.evaluation,
  });
  vrObj.documentDraftGenerations = list;

  const prevFlowPhase4 =
    typeof vrObj.gongbuhoPhase4Flow === "object" &&
    vrObj.gongbuhoPhase4Flow !== null &&
    !Array.isArray(vrObj.gongbuhoPhase4Flow)
      ? { ...(vrObj.gongbuhoPhase4Flow as Record<string, unknown>) }
      : {};

  prevFlowPhase4.documentRulesApplied = {
    traceEvent: "GONGBUHO_DOCUMENT_RULES_APPLIED" as const,
    legalDocumentId: append.legalDocumentId,
    appliedAtIso: append.occurredAtIso,
    rulesFingerprint: fingerprintGongbuhoDocumentRulesEvaluation(append.evaluation),
  };
  vrObj.gongbuhoPhase4Flow = prevFlowPhase4;

  const rfPrev = latest.riskFlags;
  const rfArr: unknown[] = Array.isArray(rfPrev) ? [...rfPrev] : [];
  for (const flag of append.evaluation.riskFlags) {
    rfArr.push({
      source: "GONGBUHO_DOCUMENT_RULES_PHASE3F",
      at: append.occurredAtIso,
      legalDocumentId: append.legalDocumentId,
      ...flag,
    });
  }

  await prisma.gongbuhoTrace.update({
    where: { id: latest.id },
    data: {
      validationResult: vrObj as Prisma.InputJsonValue,
      riskFlags: rfArr as Prisma.InputJsonValue,
    },
  });
}
