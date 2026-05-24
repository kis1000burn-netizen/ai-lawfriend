/**
 * Phase 11-A — Lawyer Review Console service (Graph/Radar/Ledger snapshot + judgment persist).
 * @see docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md
 */
import type { Prisma } from "@prisma/client";

import { listCaseInterviewAnswersService } from "@/features/case-interview/case-interview.service";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { buildGongbuhoAwareSummaryGeneratePayload } from "@/features/gongbuho/gongbuho-summary-contract.service";
import type { SessionUser } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import { buildCaseSummaryGenerationContext } from "./case-summary-context-builder";
import { resolveCaseSummaryAiModeFromEnv } from "./case-summary-ai-core-policy";
import { validateCaseSummaryContent } from "./case-summary-output-validator";
import {
  buildCaseIntelligenceGraphRuntime,
  type CaseIntelligenceGraphRuntimeResult,
} from "./case-intelligence-graph-runtime.service";
import {
  applyLawyerJudgmentDecision,
  type LawyerJudgmentDecisionInput,
} from "./lawyer-judgment-boundary-ledger.service";
import {
  parseLawyerJudgmentBoundaryLedger,
  type LawyerJudgmentBoundaryLedger,
  type LawyerJudgmentSubjectKind,
} from "./lawyer-judgment-boundary-ledger.schema";
import { validateLawyerJudgmentBoundaryLedger } from "./lawyer-judgment-boundary-validator";
import type { CaseIntelligenceJudgmentBody } from "./case-intelligence-review.api.validators";

export const PHASE11A_LAWYER_REVIEW_CONSOLE_SERVICE_MARKER =
  "PHASE11A_LAWYER_REVIEW_CONSOLE_SERVICE" as const;

export type CaseIntelligenceReviewSnapshot = {
  snapshotId: string;
  caseId: string;
  generatedAt: string;
  caseSummaryAiMode: string;
  content: ReturnType<typeof validateCaseSummaryContent>["content"];
  intelligenceGraph: CaseIntelligenceGraphRuntimeResult;
  gongbuhoResolution?: {
    via: string;
    traceId?: string;
    gongbuhoPacketId?: string;
    code?: string;
    version?: string;
  };
  readOnly: boolean;
};

type SavedDecision = {
  subjectKind: LawyerJudgmentSubjectKind;
  subjectId: string;
  judgmentState: LawyerJudgmentDecisionInput["judgmentState"];
  lawyerId: string;
  judgedAt: string;
  lawyerEditedText?: string;
  rejectionReason?: string;
  clientVisible: boolean;
  submissionReady: boolean;
};

function canViewIntelligenceReview(
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
): boolean {
  return access.isAdmin || access.isAssignedLawyer || access.isAssignedStaff;
}

function canPersistIntelligenceJudgment(
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
): boolean {
  return access.isAdmin || access.isAssignedLawyer;
}

export function extractSavedDecisions(ledger: LawyerJudgmentBoundaryLedger): SavedDecision[] {
  return ledger.entries
    .filter((entry) => entry.judgmentState !== "PENDING")
    .map((entry) => ({
      subjectKind: entry.subjectKind,
      subjectId: entry.subjectId,
      judgmentState: entry.judgmentState as SavedDecision["judgmentState"],
      lawyerId: entry.lawyerId ?? "unknown",
      judgedAt: entry.judgedAt ?? new Date().toISOString(),
      lawyerEditedText: entry.lawyerEditedText,
      rejectionReason: entry.rejectionReason,
      clientVisible: entry.clientVisible,
      submissionReady: entry.submissionReady,
    }));
}

export function mergeSavedDecisionsIntoLedger(
  freshLedger: LawyerJudgmentBoundaryLedger,
  saved: SavedDecision[],
): LawyerJudgmentBoundaryLedger {
  let ledger = freshLedger;
  for (const decision of saved) {
    const target = ledger.entries.find(
      (entry) =>
        entry.subjectKind === decision.subjectKind && entry.subjectId === decision.subjectId,
    );
    if (!target) {
      continue;
    }
    ledger = applyLawyerJudgmentDecision(ledger, {
      entryId: target.entryId,
      judgmentState: decision.judgmentState,
      lawyerId: decision.lawyerId,
      judgedAt: decision.judgedAt,
      lawyerEditedText: decision.lawyerEditedText,
      rejectionReason: decision.rejectionReason,
      clientVisible: decision.clientVisible,
      submissionReady: decision.submissionReady,
    });
  }
  return ledger;
}

async function buildFreshIntelligenceRuntime(
  user: SessionUser,
  caseId: string,
  generatedAt: string,
  mode: string,
): Promise<{
  content: ReturnType<typeof validateCaseSummaryContent>["content"];
  intelligenceGraph: CaseIntelligenceGraphRuntimeResult;
  gongbuhoResolution?: CaseIntelligenceReviewSnapshot["gongbuhoResolution"];
}> {
  const data = await listCaseInterviewAnswersService(user, caseId);
  const enriched = await buildGongbuhoAwareSummaryGeneratePayload(caseId, {
    legacy: data.summary,
    answers: data.answers,
  });
  const { ruleBasedContent } = buildCaseSummaryGenerationContext({
    case: data.case,
    interviewCompleted: data.interviewCompleted,
    answers: data.answers,
    legacySummary: data.summary,
    enriched,
  });
  const ruleValidation = validateCaseSummaryContent(ruleBasedContent);

  const intelligenceGraph = await buildCaseIntelligenceGraphRuntime({
    currentUser: user,
    caseId,
    generatedAt,
    caseSummaryAiMode: mode as ReturnType<typeof resolveCaseSummaryAiModeFromEnv>,
    summaryOperation: "CASE_SUMMARY_GENERATE",
    answers: data.answers,
    validatedContent: ruleValidation.content,
    gongbuhoResolution: enriched.gongbuhoResolution,
  });

  return {
    content: ruleValidation.content,
    intelligenceGraph,
    gongbuhoResolution: enriched.gongbuhoResolution,
  };
}

function rowToSnapshot(
  row: {
    id: string;
    caseId: string;
    generatedAt: Date;
    caseSummaryAiMode: string;
    contentJson: Prisma.JsonValue;
    graphJson: Prisma.JsonValue;
    radarJson: Prisma.JsonValue;
    ledgerJson: Prisma.JsonValue;
    gongbuhoResolutionJson: Prisma.JsonValue | null;
  },
  readOnly: boolean,
): CaseIntelligenceReviewSnapshot {
  const content = validateCaseSummaryContent(
    row.contentJson as Parameters<typeof validateCaseSummaryContent>[0],
  ).content;
  const ledger = parseLawyerJudgmentBoundaryLedger(row.ledgerJson);

  const intelligenceGraph: CaseIntelligenceGraphRuntimeResult = {
    graph: row.graphJson as CaseIntelligenceGraphRuntimeResult["graph"],
    radar: row.radarJson as CaseIntelligenceGraphRuntimeResult["radar"],
    ledger,
    radarValidationPassed: true,
    radarValidationIssues: [],
    ledgerValidationPassed: true,
    ledgerValidationIssues: [],
  };

  return {
    snapshotId: row.id,
    caseId: row.caseId,
    generatedAt: row.generatedAt.toISOString(),
    caseSummaryAiMode: row.caseSummaryAiMode,
    content,
    intelligenceGraph,
    gongbuhoResolution: row.gongbuhoResolutionJson
      ? (row.gongbuhoResolutionJson as CaseIntelligenceReviewSnapshot["gongbuhoResolution"])
      : undefined,
    readOnly,
  };
}

async function findLatestSnapshotRow(caseId: string) {
  return prisma.caseIntelligenceSnapshot.findFirst({
    where: { caseId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCaseIntelligenceReviewSnapshot(
  user: SessionUser,
  caseId: string,
): Promise<CaseIntelligenceReviewSnapshot | null> {
  const access = await getCaseAccessContext(user, caseId);
  if (!canViewIntelligenceReview(access)) {
    throw new ForbiddenError("사건 지능 검토 콘솔을 볼 권한이 없습니다.");
  }

  const row = await findLatestSnapshotRow(caseId);
  if (!row) {
    return null;
  }

  return rowToSnapshot(row, !canPersistIntelligenceJudgment(access));
}

export async function refreshCaseIntelligenceReviewSnapshot(
  user: SessionUser,
  caseId: string,
): Promise<CaseIntelligenceReviewSnapshot> {
  const access = await getCaseAccessContext(user, caseId);
  if (!canPersistIntelligenceJudgment(access)) {
    throw new ForbiddenError("사건 지능 검토 snapshot을 새로고침할 권한이 없습니다.");
  }

  const mode = resolveCaseSummaryAiModeFromEnv();
  const generatedAt = new Date().toISOString();
  const fresh = await buildFreshIntelligenceRuntime(user, caseId, generatedAt, mode);

  const previous = await findLatestSnapshotRow(caseId);
  let ledger = fresh.intelligenceGraph.ledger;
  if (previous) {
    const previousLedger = parseLawyerJudgmentBoundaryLedger(previous.ledgerJson);
    ledger = mergeSavedDecisionsIntoLedger(ledger, extractSavedDecisions(previousLedger));
  }

  const ledgerValidation = validateLawyerJudgmentBoundaryLedger(ledger, {
    strictRejectionReason: true,
  });
  if (!ledgerValidation.passed) {
    throw new ValidationError("Ledger validation failed after refresh merge", {
      code: "INTELLIGENCE_LEDGER_INVALID",
      details: ledgerValidation.issues,
    });
  }

  const intelligenceGraph: CaseIntelligenceGraphRuntimeResult = {
    ...fresh.intelligenceGraph,
    ledger: ledgerValidation.ledger,
    ledgerValidationPassed: ledgerValidation.passed,
    ledgerValidationIssues: ledgerValidation.issues,
  };

  const row = await prisma.caseIntelligenceSnapshot.create({
    data: {
      caseId,
      generatedAt: new Date(generatedAt),
      caseSummaryAiMode: mode,
      contentJson: fresh.content as Prisma.InputJsonValue,
      graphJson: intelligenceGraph.graph as Prisma.InputJsonValue,
      radarJson: intelligenceGraph.radar as Prisma.InputJsonValue,
      ledgerJson: intelligenceGraph.ledger as Prisma.InputJsonValue,
      gongbuhoResolutionJson: fresh.gongbuhoResolution
        ? (fresh.gongbuhoResolution as Prisma.InputJsonValue)
        : undefined,
      createdByUserId: user.id,
    },
  });

  return rowToSnapshot(row, !canPersistIntelligenceJudgment(access));
}

export async function applyCaseIntelligenceJudgment(
  user: SessionUser,
  caseId: string,
  body: CaseIntelligenceJudgmentBody,
): Promise<CaseIntelligenceReviewSnapshot> {
  const access = await getCaseAccessContext(user, caseId);
  if (!canPersistIntelligenceJudgment(access)) {
    throw new ForbiddenError("Ledger 판단을 저장할 권한이 없습니다.");
  }

  const row = await findLatestSnapshotRow(caseId);
  if (!row) {
    throw new NotFoundError("저장된 intelligence snapshot이 없습니다. 먼저 새로고침하세요.");
  }

  const ledger = parseLawyerJudgmentBoundaryLedger(row.ledgerJson);
  const judgedAt = new Date().toISOString();
  const updatedLedger = applyLawyerJudgmentDecision(ledger, {
    entryId: body.entryId,
    judgmentState: body.judgmentState,
    lawyerId: user.id,
    judgedAt,
    lawyerEditedText: body.lawyerEditedText,
    rejectionReason: body.rejectionReason,
    clientVisible: body.clientVisible ?? false,
    submissionReady: body.submissionReady ?? false,
  });

  const validation = validateLawyerJudgmentBoundaryLedger(updatedLedger, {
    strictRejectionReason: true,
  });
  if (!validation.passed) {
    throw new ValidationError("Ledger judgment validation failed", {
      code: "INTELLIGENCE_JUDGMENT_INVALID",
      details: validation.issues,
    });
  }

  const updatedRow = await prisma.caseIntelligenceSnapshot.update({
    where: { id: row.id },
    data: {
      ledgerJson: validation.ledger as Prisma.InputJsonValue,
    },
  });

  return rowToSnapshot(updatedRow, false);
}
