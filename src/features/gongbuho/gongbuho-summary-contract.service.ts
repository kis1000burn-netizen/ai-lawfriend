import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { InterviewAnswerMap } from "@/features/question-set/question-set.types";

/** `listCaseInterviewAnswersService` / `buildInterviewSummary` 가 만드는 1차 요약 버킷 */
export type InterviewSummaryBuckets = {
  overview: string;
  timeline: string[];
  keyIssues: string[];
  missingInfo: string[];
  checklist: string[];
};

export type GongbuhoSummaryContractSection = {
  heading: string;
  body: string;
};

export type GongbuhoSummaryResolution =
  | {
      via: "trace";
      traceId: string;
      gongbuhoPacketId: string;
      code: string;
      version: string;
    }
  | {
      via: "question_set_envelope";
      gongbuhoPacketId: string;
      code: string;
      version: string;
    };

const outputContractSchema = z
  .object({
    summary: z.array(z.string()).optional(),
    documents: z.array(z.string()).optional(),
  })
  .passthrough();

function readPacketJsonRoot(packetJson: unknown): Record<string, unknown> | null {
  if (typeof packetJson !== "object" || packetJson === null || Array.isArray(packetJson)) {
    return null;
  }
  return packetJson as Record<string, unknown>;
}

/** 패킷 `outputContract.summary` 목차를 안전히 파싱한다. 빈 배열·누락 시 `null`. */
export function parseGongbuhoSummaryHeadings(packetJson: unknown): string[] | null {
  const root = readPacketJsonRoot(packetJson);
  if (!root) return null;
  const ocRaw = root.outputContract;
  const oc = outputContractSchema.safeParse(ocRaw);
  if (!oc.success) return null;
  const headings = oc.data.summary?.map((s) => s.trim()).filter((s) => s.length > 0);
  return headings?.length ? headings : null;
}

export function extractGongbuhoExpertReviewPoints(packetJson: unknown): string[] {
  const root = readPacketJsonRoot(packetJson);
  if (!root) return [];
  const v = root.expertReviewPoints;
  if (!Array.isArray(v)) return [];
  return v
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

function formatInterviewAnswerPlain(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return String(value);
  return String(value);
}

function answersForKeys(map: InterviewAnswerMap, keys: string[]): string {
  const chunks: string[] = [];
  for (const key of keys) {
    const raw = map[key];
    const text = formatInterviewAnswerPlain(raw).trim();
    if (text) chunks.push(text);
  }
  return chunks.join("\n\n");
}

function timelineBlock(legacy: InterviewSummaryBuckets): string {
  const lines = legacy.timeline.filter((s) => s.trim().length > 0);
  if (!lines.length) return "(인터뷰에서 주요 일시·경위 정보가 충분히 채워지지 않았습니다.)";
  return lines.map((line, i) => `${i + 1}. ${line}`).join("\n");
}

function issuesBlock(legacy: InterviewSummaryBuckets): string {
  if (!legacy.keyIssues.length) {
    return "(쟁점·이슈가 아직 정리되지 않았습니다.)";
  }
  return legacy.keyIssues.map((line, i) => `${i + 1}. ${line}`).join("\n");
}

function missingBlock(legacy: InterviewSummaryBuckets): string {
  if (!legacy.missingInfo.length) {
    return "(누락으로 표시된 필수 항목이 없습니다. 다만 실제 사건에서는 추가 자료가 필요할 수 있습니다.)";
  }
  return legacy.missingInfo.map((line, i) => `${i + 1}. ${line}`).join("\n");
}

function expertReviewBlock(points: string[]): string {
  if (!points.length) {
    return "(패킷에 정의된 변호사 검토 포인트가 없습니다. 담당 변호사의 별도 검토가 필요합니다.)";
  }
  return points.map((p, i) => `${i + 1}. ${p}`).join("\n");
}

function checklistBlock(legacy: InterviewSummaryBuckets): string {
  if (!legacy.checklist.length) return "(체크리스트 항목이 없습니다.)";
  return legacy.checklist.map((line, i) => `${i + 1}. ${line}`).join("\n");
}

function rollupAnswersBlock(map: InterviewAnswerMap, maxChars = 4000): string {
  const rows = Object.entries(map)
    .map(([k, v]) => {
      const t = formatInterviewAnswerPlain(v).trim();
      if (!t) return null;
      return `[${k}] ${t}`;
    })
    .filter((row): row is string => Boolean(row));
  if (!rows.length) return "(작성된 인터뷰 답변이 없습니다.)";
  const full = rows.join("\n");
  if (full.length <= maxChars) return full;
  return `${full.slice(0, maxChars)}\n\n…(이하 생략 — 전체 답변은 인터뷰 화면에서 확인하세요.)`;
}

const LAWYER_REVIEW_DISCLAIMER =
  "아래 항목은 패킷에 정의된 참고용 검토 포인트이며, 실제 사건에서 모두 적용되지 않을 수 있습니다. 최종 법률 판단·소송 전략은 담당 변호사의 검토가 필요합니다.";

const RISK_LANGUAGE_NOTE =
  "자동 생성 결과이므로 단정적 법률 표현·확정적 승소 전망 등은 피하고, 증거와 법리는 별도 검토가 필요합니다.";

/**
 * 공부호 `outputContract.summary` 의 각 제목에 대해, 기존 요약 버킷·답변·검토 포인트로 본문을 채운다.
 * (LLM 없음 — 인터뷰 기반 휴리스틱 매핑)
 */
export function buildGongbuhoContractSections(input: {
  headings: string[];
  legacy: InterviewSummaryBuckets;
  answers: InterviewAnswerMap;
  expertReviewPoints: string[];
}): GongbuhoSummaryContractSection[] {
  const { headings, legacy, answers, expertReviewPoints } = input;

  return headings.map((heading) => {
    const h = heading.trim();
    let body = "";

    if (/변호사\s*검토\s*포인트/.test(h)) {
      body = [LAWYER_REVIEW_DISCLAIMER, "", expertReviewBlock(expertReviewPoints)].join("\n");
    } else if (/위험\s*표현|확정\s*회피/.test(h)) {
      body = RISK_LANGUAGE_NOTE;
    } else if (/누락/.test(h)) {
      body = missingBlock(legacy);
    } else if (/쟁점/.test(h)) {
      body = issuesBlock(legacy);
    } else if (/증거/.test(h)) {
      body =
        answersForKeys(answers, [
          "evidence_summary",
          "witness_detail",
          "witness_summary",
        ]) || "(증거 관련 답변이 비어 있습니다.)";
    } else if (/피해|손해/.test(h)) {
      body =
        answersForKeys(answers, [
          "civil_damage_or_claim",
          "damage_amount",
          "desired_result",
        ]) || legacy.keyIssues.join("\n\n") || "(피해 관련 답변이 비어 있습니다.)";
    } else if (/기망|처분/.test(h)) {
      body =
        answersForKeys(answers, ["criminal_allegation", "case_background", "current_status"]) ||
        "(해당 정황을 정리할 답변이 부족합니다.)";
    } else if (/핵심\s*사실|사실관계/.test(h)) {
      body =
        answersForKeys(answers, ["case_background", "current_status", "people_involved"]) ||
        legacy.overview ||
        "(사실관계 답변이 부족합니다.)";
    } else if (/당사자|관계/.test(h)) {
      body = answersForKeys(answers, ["people_involved"]) || "(당사자·관계 정보가 비어 있습니다.)";
    } else if (/일시|날짜|타임라인|경위/.test(h)) {
      body = timelineBlock(legacy);
    } else if (/사건\s*개요|^개요/.test(h) && !/검토/.test(h)) {
      body = legacy.overview || "(사건 개요를 만들 수 있는 답변이 부족합니다.)";
    } else if (/체크리스트|확인\s*사항/.test(h)) {
      body = checklistBlock(legacy);
    } else {
      body = rollupAnswersBlock(answers);
    }

    return { heading: h, body: body.trim() };
  });
}

function extractGongbuhoPacketIdFromQuestionSetDefinition(definitionJson: unknown): string | null {
  if (definitionJson === null || definitionJson === undefined) return null;
  if (typeof definitionJson !== "object" || Array.isArray(definitionJson)) return null;
  const root = definitionJson as Record<string, unknown>;
  if (root.source !== "GONGBUHO") return null;
  const gh = root.gongbuho;
  if (!gh || typeof gh !== "object" || Array.isArray(gh)) return null;
  const packetId = (gh as Record<string, unknown>).packetId;
  return typeof packetId === "string" && packetId.trim().length > 0 ? packetId.trim() : null;
}

/**
 * 사건 요약에 사용할 공부호 패킷 JSON을 찾는다.
 * 1) 최신 `GongbuhoTrace`(적용 이력)  
 * 2) `Case.questionSetId` → 질문셋 definitionJson 의 공부호 envelope `packetId`
 */
export async function resolveGongbuhoPacketJsonForCaseSummary(caseId: string): Promise<{
  packetJson: unknown;
  resolution: GongbuhoSummaryResolution;
} | null> {
  const traceRow = await prisma.gongbuhoTrace.findFirst({
    where: { caseId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      gongbuhoPacketId: true,
      code: true,
      version: true,
      gongbuhoPacket: { select: { packetJson: true } },
    },
  });

  if (traceRow?.gongbuhoPacket?.packetJson != null) {
    return {
      packetJson: traceRow.gongbuhoPacket.packetJson,
      resolution: {
        via: "trace",
        traceId: traceRow.id,
        gongbuhoPacketId: traceRow.gongbuhoPacketId,
        code: traceRow.code,
        version: traceRow.version,
      },
    };
  }

  const caseRow = await prisma.case.findUnique({
    where: { id: caseId },
    select: { questionSetId: true },
  });
  if (!caseRow?.questionSetId) return null;

  const qs = await prisma.questionSet.findUnique({
    where: { id: caseRow.questionSetId },
    select: { definitionJson: true },
  });
  const packetId = extractGongbuhoPacketIdFromQuestionSetDefinition(qs?.definitionJson);
  if (!packetId) return null;

  const packet = await prisma.gongbuhoPacket.findUnique({
    where: { id: packetId },
    select: { id: true, code: true, version: true, packetJson: true },
  });
  if (!packet?.packetJson) return null;

  return {
    packetJson: packet.packetJson,
    resolution: {
      via: "question_set_envelope",
      gongbuhoPacketId: packet.id,
      code: packet.code,
      version: packet.version,
    },
  };
}

export type GongbuhoEnhancedSummaryPayload = {
  outputContractApplied: boolean;
  gongbuhoResolution?: GongbuhoSummaryResolution;
  contractSections?: GongbuhoSummaryContractSection[];
  /** 기존 UI·API 호환 — 공부호 미적용 시 기존 흐름과 동일하게 채운다. */
  flat: {
    caseOverview: string;
    timeline: string[];
    issues: string[];
    riskNotes: string[];
    checklist: string[];
  };
};

/**
 * 패킷 `outputContract.summary` 가 있으면 섹션을 생성하고,
 * 레거시 플랫 필드를 보강(개요는 첫 섹션 또는 기존 overview)하여 반환한다.
 */
export function mergeInterviewSummaryWithGongbuhoContract(input: {
  legacy: InterviewSummaryBuckets;
  answers: InterviewAnswerMap;
  packetJson: unknown;
  resolution: GongbuhoSummaryResolution;
}): GongbuhoEnhancedSummaryPayload {
  const headings = parseGongbuhoSummaryHeadings(input.packetJson);
  const experts = extractGongbuhoExpertReviewPoints(input.packetJson);

  if (!headings) {
    return {
      outputContractApplied: false,
      flat: {
        caseOverview: input.legacy.overview,
        timeline: input.legacy.timeline,
        issues: input.legacy.keyIssues,
        riskNotes: input.legacy.missingInfo,
        checklist: input.legacy.checklist,
      },
    };
  }

  const contractSections = buildGongbuhoContractSections({
    headings,
    legacy: input.legacy,
    answers: input.answers,
    expertReviewPoints: experts,
  });

  const firstOverviewBody =
    contractSections.find(
      (s) => /사건\s*개요|^개요/.test(s.heading) && !/검토/.test(s.heading),
    )?.body ?? contractSections[0]?.body ?? input.legacy.overview;

  return {
    outputContractApplied: true,
    gongbuhoResolution: input.resolution,
    contractSections,
    flat: {
      caseOverview: firstOverviewBody,
      timeline: input.legacy.timeline,
      issues: input.legacy.keyIssues,
      riskNotes: input.legacy.missingInfo,
      checklist:
        experts.length > 0
          ? [...input.legacy.checklist, `패킷 변호사 검토 포인트 ${experts.length}건이 「변호사 검토 포인트」 섹션에 따로 정리되었습니다.`]
          : input.legacy.checklist,
    },
  };
}

export async function buildGongbuhoAwareSummaryGeneratePayload(caseId: string, input: {
  legacy: InterviewSummaryBuckets;
  answers: InterviewAnswerMap;
}): Promise<GongbuhoEnhancedSummaryPayload> {
  const resolved = await resolveGongbuhoPacketJsonForCaseSummary(caseId);
  if (!resolved) {
    return {
      outputContractApplied: false,
      flat: {
        caseOverview: input.legacy.overview,
        timeline: input.legacy.timeline,
        issues: input.legacy.keyIssues,
        riskNotes: input.legacy.missingInfo,
        checklist: input.legacy.checklist,
      },
    };
  }

  return mergeInterviewSummaryWithGongbuhoContract({
    legacy: input.legacy,
    answers: input.answers,
    packetJson: resolved.packetJson,
    resolution: resolved.resolution,
  });
}
