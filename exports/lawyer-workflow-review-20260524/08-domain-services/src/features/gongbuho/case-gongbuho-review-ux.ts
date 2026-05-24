import type { QuestionSetStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CaseGongbuhoCandidateSelectionPolicy,
  CaseGongbuhoCandidatesPayload,
  GongbuhoCandidateItem,
  GongbuhoLatestTraceSummary,
  GongbuhoCandidatesResolutionReason,
} from "@/features/gongbuho/gongbuho-case-candidate.service";
import { getCaseGongbuhoCandidates } from "@/features/gongbuho/gongbuho-case-candidate.service";
import type { GongbuhoDocumentRulesEvaluation } from "@/features/gongbuho/gongbuho-document-rules.service";
import { extractGongbuhoRuleStringArrays } from "@/features/gongbuho/gongbuho-document-rules.service";
import {
  extractGongbuhoExpertReviewPoints,
  parseGongbuhoSummaryHeadings,
  resolveGongbuhoPacketJsonForCaseSummary,
} from "@/features/gongbuho/gongbuho-summary-contract.service";

export type GongbuhoReviewUxViewerKind = "client" | "lawyer_staff" | "platform_admin";

export function gongbuhoReviewUxViewerKindFromSessionRole(role: UserRole): GongbuhoReviewUxViewerKind {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "platform_admin";
  if (role === "LAWYER" || role === "STAFF") return "lawyer_staff";
  return "client";
}

export type CaseGongbuhoReviewUxModel = {
  viewerKind: GongbuhoReviewUxViewerKind;
  /** 후보·Trace·질문셋 envelope 중 하나라도 있으면 true */
  hasGongbuhoSignal: boolean;
  appliedPacketLabel: string | null;
  questionSetOperational: "operational" | "not_operational" | "not_linked";
  questionSetTitle: string | null;
  outputContractApplied: boolean;
  outputContractSectionCount: number;
  selectionPolicy: CaseGongbuhoCandidateSelectionPolicy | null;
  resolutionReason?: GongbuhoCandidatesResolutionReason;
  caseType: string | null;
  candidates: GongbuhoCandidateItem[];
  latestTrace: GongbuhoLatestTraceSummary | null;
  documentRules: {
    present: boolean;
    applied: boolean;
    validationPendingCount: number;
    forbiddenHitCount: number;
    documentRiskFlagCount: number;
    expertReviewPointCount: number;
    sourceDocumentTitle: string | null;
    versionNo: number | null;
  };
  packetExpertReviewPoints: string[];
  traceValidationResult: unknown | null;
  traceExpertReviewPoints: unknown | null;
  /** 플랫폼 관리자용 패킷 JSON 문자열 미리보기(과대 방지) */
  packetJsonPreview: string | null;
};

type InterviewEnvelopeMeta =
  | { linked: false }
  | {
      linked: true;
      catalogStatus: QuestionSetStatus;
      isActive: boolean;
      title: string;
      gongbuhoPacket: { code: string; version: string; name: string | null } | null;
    };

function truncateJsonPreview(raw: unknown, maxChars = 6000): string | null {
  try {
    const s = JSON.stringify(raw, null, 2);
    if (!s.trim()) return null;
    if (s.length <= maxChars) return s;
    return `${s.slice(0, maxChars)}\n…(truncated)`;
  } catch {
    return null;
  }
}

function parseDocumentRulesFromSnapshot(
  snapshotJson: unknown,
): GongbuhoDocumentRulesEvaluation | null {
  if (snapshotJson === null || typeof snapshotJson !== "object" || Array.isArray(snapshotJson)) {
    return null;
  }
  const root = snapshotJson as Record<string, unknown>;
  const g = root.gongbuhoDocumentRules;
  if (g === null || typeof g !== "object" || Array.isArray(g)) return null;
  const ev = g as GongbuhoDocumentRulesEvaluation;
  if (typeof ev.applied !== "boolean") return null;
  return ev;
}

async function loadInterviewEnvelopeMeta(caseId: string): Promise<InterviewEnvelopeMeta> {
  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { questionSetId: true },
  });
  if (!c?.questionSetId) return { linked: false };

  const meta = await prisma.questionSet.findUnique({
    where: { id: c.questionSetId },
    select: {
      name: true,
      catalogStatus: true,
      isActive: true,
      definitionJson: true,
    },
  });
  if (!meta) return { linked: false };

  let gongbuhoPacket: { code: string; version: string; name: string | null } | null = null;
  const dj = meta.definitionJson;
  if (dj !== null && typeof dj === "object" && !Array.isArray(dj)) {
    const root = dj as Record<string, unknown>;
    if (root.source === "GONGBUHO") {
      const gh = root.gongbuho;
      if (gh !== null && typeof gh === "object" && !Array.isArray(gh)) {
        const g = gh as Record<string, unknown>;
        const packetId = typeof g.packetId === "string" ? g.packetId.trim() : "";
        if (packetId) {
          const p = await prisma.gongbuhoPacket.findUnique({
            where: { id: packetId },
            select: { code: true, version: true, name: true },
          });
          if (p) {
            gongbuhoPacket = { code: p.code, version: p.version, name: p.name ?? null };
          }
        }
      }
    }
  }

  return {
    linked: true,
    catalogStatus: meta.catalogStatus,
    isActive: meta.isActive,
    title: meta.name,
    gongbuhoPacket,
  };
}

/** 순수 매핑 및 카운트 — Vitest 대상 */
export function buildCaseGongbuhoReviewUxModel(input: {
  viewerKind: GongbuhoReviewUxViewerKind;
  candidatesPayload: CaseGongbuhoCandidatesPayload | null;
  interviewMeta: InterviewEnvelopeMeta;
  packetJsonResolved: { packetJson: unknown } | null;
  traceDetail: {
    validationResult: unknown;
    expertReviewPoints: unknown;
    riskFlags: unknown;
  } | null;
  latestLegalDocVersion: {
    versionNo: number;
    snapshotJson: unknown;
    documentTitle: string;
  } | null;
}): CaseGongbuhoReviewUxModel {
  const { viewerKind } = input;
  const cand = input.candidatesPayload;

  const packetJson =
    input.packetJsonResolved?.packetJson ?? null;
  const headings = parseGongbuhoSummaryHeadings(packetJson);
  const packetRules = extractGongbuhoRuleStringArrays(packetJson);
  const packetExperts = extractGongbuhoExpertReviewPoints(packetJson);

  const docSnap = input.latestLegalDocVersion;
  const docEval = docSnap ? parseDocumentRulesFromSnapshot(docSnap.snapshotJson) : null;

  const validationPendingCount =
    docEval && docEval.applied ? docEval.validationChecklist.length : packetRules.validationRules.length;

  const forbiddenHitCount = docEval?.forbiddenHits.length ?? 0;
  const documentRiskFlagCount = docEval?.riskFlags.length ?? 0;

  const expertReviewPointCount = docEval?.applied
    ? docEval.expertReviewPoints.length
    : packetExperts.length;

  const latestTrace = cand?.latestTrace ?? null;

  let appliedPacketLabel: string | null = null;
  if (latestTrace) {
    appliedPacketLabel = `${latestTrace.code} v${latestTrace.version}`;
  } else if (input.interviewMeta.linked && input.interviewMeta.gongbuhoPacket) {
    const p = input.interviewMeta.gongbuhoPacket;
    appliedPacketLabel = `${p.code} v${p.version}`;
  } else if (cand?.candidates.length === 1) {
    const only = cand.candidates[0]!;
    appliedPacketLabel = `${only.code} v${only.version}`;
  }

  let questionSetOperational: CaseGongbuhoReviewUxModel["questionSetOperational"] = "not_linked";
  let questionSetTitle: string | null = null;
  if (input.interviewMeta.linked) {
    questionSetTitle = input.interviewMeta.title;
    const op =
      input.interviewMeta.isActive && input.interviewMeta.catalogStatus === "PUBLISHED";
    questionSetOperational = op ? "operational" : "not_operational";
  }

  const hasGongbuhoSignal = Boolean(
    (cand && (cand.candidates.length > 0 || cand.latestTrace)) ||
      (input.interviewMeta.linked && input.interviewMeta.gongbuhoPacket) ||
      packetJson !== null ||
      docEval?.applied,
  );

  return {
    viewerKind,
    hasGongbuhoSignal,
    appliedPacketLabel,
    questionSetOperational,
    questionSetTitle,
    outputContractApplied: Boolean(headings?.length),
    outputContractSectionCount: headings?.length ?? 0,
    selectionPolicy: cand?.selectionPolicy ?? null,
    resolutionReason: cand?.resolutionReason,
    caseType: cand?.caseType ?? null,
    candidates: cand?.candidates ?? [],
    latestTrace,
    traceValidationResult: input.traceDetail?.validationResult ?? null,
    traceExpertReviewPoints: input.traceDetail?.expertReviewPoints ?? null,
    packetJsonPreview: viewerKind === "platform_admin" ? truncateJsonPreview(packetJson) : null,
    packetExpertReviewPoints: packetExperts,
    documentRules: {
      present: Boolean(docSnap),
      applied: Boolean(docEval?.applied),
      validationPendingCount,
      forbiddenHitCount,
      documentRiskFlagCount,
      expertReviewPointCount,
      sourceDocumentTitle: docSnap?.documentTitle ?? null,
      versionNo: docSnap?.versionNo ?? null,
    },
  };
}

export async function loadCaseGongbuhoReviewUxModel(
  caseId: string,
  viewerKind: GongbuhoReviewUxViewerKind,
): Promise<CaseGongbuhoReviewUxModel | null> {
  const exists = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true },
  });
  if (!exists) return null;

  const [
    candidatesPayload,
    interviewMeta,
    packetResolved,
    traceDetailRow,
    legalDocVersionRowRaw,
  ] = await Promise.all([
    getCaseGongbuhoCandidates(caseId),
    loadInterviewEnvelopeMeta(caseId),
    resolveGongbuhoPacketJsonForCaseSummary(caseId),
    prisma.gongbuhoTrace.findFirst({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      select: {
        validationResult: true,
        expertReviewPoints: true,
        riskFlags: true,
      },
    }),
    prisma.legalDocumentVersion.findFirst({
      where: { document: { caseId } },
      orderBy: { createdAt: "desc" },
      select: {
        versionNo: true,
        snapshotJson: true,
        document: { select: { title: true } },
      },
    }),
  ]);

  const latestLegalDocVersion = normalizeLatestLegalDocVersion(legalDocVersionRowRaw);

  return buildCaseGongbuhoReviewUxModel({
    viewerKind,
    candidatesPayload,
    interviewMeta,
    packetJsonResolved: packetResolved ? { packetJson: packetResolved.packetJson } : null,
    traceDetail: traceDetailRow,
    latestLegalDocVersion,
  });
}

function normalizeLatestLegalDocVersion(
  row: {
    versionNo: number;
    snapshotJson: unknown;
    document: { title: string };
  } | null,
): { versionNo: number; snapshotJson: unknown; documentTitle: string } | null {
  if (!row) return null;
  return {
    versionNo: row.versionNo,
    snapshotJson: row.snapshotJson,
    documentTitle: row.document.title,
  };
}
