import type { CaseStatus, Prisma } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit-log";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import {
  getActiveQuestionSet,
  getQuestionSetById,
} from "@/features/question-set/question-set.service";
import type {
  InterviewAnswerMap,
  InterviewAnswerValue,
  InterviewFlowPayload,
  QuestionSetEntity,
} from "@/features/question-set/question-set.types";
import {
  buildInterviewProgress,
  getNextQuestionKey,
  resolveInterviewQuestions,
} from "@/features/case-interview/interview-branching.utils";
import { isCatalogUserRoleAllowedForQuestionSet } from "@/features/case-interview/interview-catalog-visibility";
import { getAllowedLifecycleActionsForCase } from "@/lib/cases/allowed-actions";
import {
  canPerformCaseInterview,
  getCaseAccessContext,
  type CaseAccessContext,
} from "@/features/cases/case.permissions";
import { findCaseById, updateCaseById } from "@/features/cases/case.repository";
import {
  CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE,
  findInterviewCompletionByCaseId,
  markInterviewCompleted,
} from "@/features/case-interview/case-interview.repository";
import { assertQuestionSetOperationalForInterview } from "@/features/gongbuho/gongbuho-interview-binding.service";

/**
 * 인터뷰 **런타임** (조회·저장·완료) 질문 소스: `QuestionSet.questions` JSON (플랫).
 * 사건 `Case.questionSetId`가 있으면 게시(PUBLISHED)·활성 질문셋(Phase 3-D 공부호 바인딩), 없으면 전역 `getActiveQuestionSet` 유지.
 * `resolveInterviewQuestions` + `CaseAccessContext`: `audience`·`visibleToRoles`·`visibilityRule`·`active` 한 축.
 * `QuestionSet.definitionJson.sections` 는 관리/카탈로그(Zod) 구조이며 EVIDENCE-330 기준 필수 완료 검증에는 쓰지 않는다.
 */
type SummaryAnswerRow = { questionKey: string; answerText: string }[];

export function buildInterviewSummary(
  caseTitle: string,
  caseCategory: string | null | undefined,
  answers: SummaryAnswerRow,
) {
  const byKey = new Map(answers.map((item) => [item.questionKey, item.answerText]));

  const overview = [
    `${caseTitle} 사건에 대해 의뢰인이 입력한 내용을 기준으로 정리한 1차 요약입니다.`,
    byKey.get("case_background"),
    byKey.get("current_status"),
  ]
    .filter(Boolean)
    .join(" ");

  const timeline = [byKey.get("case_background"), byKey.get("current_status")].filter(
    (item): item is string => Boolean(item),
  );

  const keyIssues = [
    caseCategory ? `${caseCategory} 관련 분쟁` : null,
    byKey.get("criminal_allegation") ??
      byKey.get("civil_damage_or_claim") ??
      byKey.get("family_children_property") ??
      null,
    byKey.get("desired_result") ?? null,
  ].filter((item): item is string => Boolean(item));

  const missingInfo: string[] = [];
  if (!byKey.get("people_involved")) missingInfo.push("관련 인물 정리 필요");
  if (!byKey.get("evidence_summary")) missingInfo.push("증거 자료 정리 필요");
  if (!byKey.get("desired_result")) missingInfo.push("원하는 결과 명확화 필요");

  const checklist = [
    "상담 전 상대방 정보와 주요 날짜를 다시 확인하세요.",
    "현재 보유한 증거 원본 보존 여부를 점검하세요.",
    missingInfo.length > 0
      ? `추가 확인 필요: ${missingInfo.join(", ")}`
      : "현재 입력 기준 필수 기본항목은 충족되었습니다.",
  ];

  return {
    overview,
    timeline,
    keyIssues,
    missingInfo,
    checklist,
  };
}

function formatAnswerForSummary(value: InterviewAnswerValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return String(value);
  return String(value);
}

function interviewAnswerMapToSummaryRows(map: InterviewAnswerMap): SummaryAnswerRow {
  return Object.entries(map).map(([questionKey, value]) => ({
    questionKey,
    answerText: formatAnswerForSummary(value),
  }));
}

export function parseStoredAnswers(rawText: string | null | undefined): InterviewAnswerMap {
  if (!rawText) return {};

  try {
    const parsed = JSON.parse(rawText) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as InterviewAnswerMap)
      : {};
  } catch {
    return {};
  }
}

async function getInterviewAnswerMemo(caseId: string) {
  return prisma.caseTimelineMemo.findFirst({
    where: {
      caseId,
      noteType: CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function upsertInterviewAnswerMemo(
  caseId: string,
  answers: InterviewAnswerMap,
  actorUserId: string,
) {
  const existing = await getInterviewAnswerMemo(caseId);

  if (existing) {
    return prisma.caseTimelineMemo.update({
      where: { id: existing.id },
      data: {
        content: JSON.stringify(answers),
        authorUserId: actorUserId,
      },
    });
  }

  return prisma.caseTimelineMemo.create({
    data: {
      caseId,
      noteType: CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE,
      memoType: "USER_NOTE",
      content: JSON.stringify(answers),
      authorUserId: actorUserId,
    },
  });
}

/**
 * Batch A-1 / 안 A — 인터뷰 **수행** 권한: OWNER · ADMIN · ASSIGNED_LAWYER · ASSIGNED_STAFF
 * (`canPerformCaseInterview` = getCaseAccessContext + 동일 기준. 조회·저장·완료·숨김정리 **한 축**)
 */
function canManageInterview(
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
): boolean {
  return canPerformCaseInterview(access);
}

async function assertCaseInterviewAccess(currentUser: SessionUser, caseId: string) {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!canManageInterview(access)) {
    throw new ForbiddenError("인터뷰 접근 권한이 없습니다.");
  }
}

async function resolveQuestionSetEntityForCaseInterview(caseId: string): Promise<QuestionSetEntity> {
  const row = await prisma.case.findUnique({
    where: { id: caseId },
    select: { questionSetId: true },
  });

  if (row?.questionSetId) {
    const [questionSet, operational] = await Promise.all([
      getQuestionSetById(row.questionSetId),
      prisma.questionSet.findUnique({
        where: { id: row.questionSetId },
        select: { catalogStatus: true, isActive: true },
      }),
    ]);

    if (!questionSet || !operational) {
      throw new ValidationError("사건에 연결된 질문셋을 찾을 수 없습니다.", {
        code: "CASE_BOUND_QUESTION_SET_MISSING",
      });
    }
    assertQuestionSetOperationalForInterview(operational);
    return questionSet;
  }

  const active = await getActiveQuestionSet();
  if (!active) {
    throw new Error("활성 질문셋이 없습니다.");
  }
  return active;
}

async function resolveInterviewQuestionSetPersistRow(caseId: string): Promise<{
  id: string;
  code: string | null;
  version: string;
} | null> {
  const caseRow = await prisma.case.findUnique({
    where: { id: caseId },
    select: { questionSetId: true },
  });

  if (caseRow?.questionSetId) {
    const meta = await prisma.questionSet.findUnique({
      where: { id: caseRow.questionSetId },
      select: { id: true, code: true, version: true },
    });
    return meta;
  }

  return prisma.questionSet.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, code: true, version: true },
  });
}

/**
 * 사건 바인딩 또는 전역 활성 QuestionSet 기준 질문 셋.
 * [346] / PR-346-A: `visibleToRoles`·질문 `audience`·`active`·`visibilityRule` = `getInterviewFlow`·`complete` 동일.
 */
export async function getInterviewFlowInternal(
  caseId: string,
  access: CaseAccessContext,
  currentUser: SessionUser,
): Promise<InterviewFlowPayload> {
  const questionSet = await resolveQuestionSetEntityForCaseInterview(caseId);

  if (!isCatalogUserRoleAllowedForQuestionSet(questionSet.visibleToRoles, currentUser)) {
    throw new ForbiddenError("이 질문셋에 대한 인터뷰를 볼 수 있는 역할이 아닙니다.");
  }

  const memo = await getInterviewAnswerMemo(caseId);
  const answers = parseStoredAnswers(memo?.content);

  const resolvedQuestions = resolveInterviewQuestions(questionSet.questions, answers, access);
  const visibleQuestions = resolvedQuestions.filter((q) => q.isVisible);
  const progress = buildInterviewProgress(resolvedQuestions);
  const nextQuestionKey = getNextQuestionKey(resolvedQuestions);

  return {
    questionSetId: questionSet.id,
    questionSetName: questionSet.name,
    questions: resolvedQuestions,
    visibleQuestions,
    answers,
    nextQuestionKey,
    progress,
  };
}

export async function getInterviewFlow(
  currentUser: SessionUser,
  caseId: string,
): Promise<InterviewFlowPayload> {
  await assertCaseInterviewAccess(currentUser, caseId);
  const access = await getCaseAccessContext(currentUser, caseId);
  return getInterviewFlowInternal(caseId, access, currentUser);
}

export type SaveInterviewAnswerInput = {
  caseId: string;
  questionKey: string;
  value: string | number | boolean | string[] | null;
  actorUserId: string;
};

export async function saveInterviewAnswer(
  currentUser: SessionUser,
  input: Omit<SaveInterviewAnswerInput, "actorUserId">,
): Promise<InterviewFlowPayload> {
  await assertCaseInterviewAccess(currentUser, input.caseId);
  const access = await getCaseAccessContext(currentUser, input.caseId);
  const found = await findCaseById(input.caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const { caseId, questionKey, value } = input;

  const memo = await getInterviewAnswerMemo(caseId);
  const currentAnswers = parseStoredAnswers(memo?.content);

  const nextAnswers: InterviewAnswerMap = {
    ...currentAnswers,
    [questionKey]: value,
  };

  await upsertInterviewAnswerMemo(caseId, nextAnswers, currentUser.id);

  if (found.status === "CREATED") {
    await updateCaseById(caseId, { status: "IN_INTERVIEW" });
  }

  return getInterviewFlowInternal(caseId, access, currentUser);
}

export async function clearHiddenInterviewAnswers(
  currentUser: SessionUser,
  caseId: string,
): Promise<InterviewFlowPayload> {
  await assertCaseInterviewAccess(currentUser, caseId);
  const access = await getCaseAccessContext(currentUser, caseId);
  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const flow = await getInterviewFlowInternal(caseId, access, currentUser);
  const visibleKeys = new Set(flow.visibleQuestions.map((q) => q.key));

  const cleaned: InterviewAnswerMap = {};
  for (const [key, value] of Object.entries(flow.answers)) {
    if (visibleKeys.has(key)) {
      cleaned[key] = value;
    }
  }

  await upsertInterviewAnswerMemo(caseId, cleaned, currentUser.id);
  return getInterviewFlowInternal(caseId, access, currentUser);
}

export async function getCaseInterviewQuestionSetService(
  currentUser: SessionUser,
  caseId: string,
) {
  await getCaseAccessContext(currentUser, caseId);
  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const qs = await resolveQuestionSetEntityForCaseInterview(caseId);

  return {
    caseId: found.id,
    category: found.category,
    questions: qs?.questions ?? [],
    questionSet: qs,
  };
}

export async function listCaseInterviewAnswersService(
  currentUser: SessionUser,
  caseId: string,
) {
  await getCaseAccessContext(currentUser, caseId);
  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const memo = await getInterviewAnswerMemo(caseId);
  const answersMap = parseStoredAnswers(memo?.content);
  const summary = buildInterviewSummary(
    found.title,
    found.category,
    interviewAnswerMapToSummaryRows(answersMap),
  );
  const completion = await findInterviewCompletionByCaseId(caseId);

  const qs = await resolveQuestionSetEntityForCaseInterview(caseId);

  return {
    case: {
      id: found.id,
      title: found.title,
      category: found.category,
      status: found.status,
    },
    questions: qs?.questions ?? [],
    answers: answersMap,
    summary,
    interviewCompleted: Boolean(completion),
    completedAt: completion?.createdAt ?? null,
  };
}

const TERMINAL_NO_INTERVIEW_COMPLETE: readonly CaseStatus[] = [
  "CLOSED",
  "REJECTED",
  "DELETED",
];

/**
 * IV-04/LC-03: 인터뷰 완료 API **공통** — 종결·반려·삭제는 거부.
 * (테스트에서 직접 호출 가능)
 */
export function assertCaseTerminalAllowsInterviewComplete(status: CaseStatus) {
  if (TERMINAL_NO_INTERVIEW_COMPLETE.includes(status)) {
    throw new ValidationError(
      "종결·반려·삭제된 사건에서는 인터뷰를 완료할 수 없습니다.",
    );
  }
}

/**
 * ST-03 / LC-03: `CASE_TRANSITIONS` — `IN_INTERVIEW` → `INTERVIEW_DONE`(`COMPLETE_INTERVIEW`)와 동일 **상태** 전제.
 * (역할·권한은 기존 `assertCaseInterviewAccess` / `canPerformCaseInterview` 축 유지)
 */
export function assertInInterviewForNewComplete(status: CaseStatus) {
  if (status === "HOLD") {
    throw new ValidationError("보류 사건은 재개된 뒤 인터뷰를 완료할 수 있습니다.");
  }
  if (status === "IN_INTERVIEW") {
    return;
  }
  if (status === "CREATED" || status === "INTAKE_PENDING") {
    throw new ValidationError(
      "인터뷰를 완료하려면 사건이 '인터뷰 진행 중'이어야 합니다. 답변을 저장하거나 '인터뷰 시작'을 먼저 진행하세요.",
    );
  }
  throw new ValidationError("현재 사건 단계에서 인터뷰를 완료할 수 없습니다.");
}

type CaseRow = NonNullable<Awaited<ReturnType<typeof findCaseById>>>;

async function buildCompleteInterviewServiceResponse(
  currentUser: SessionUser,
  caseId: string,
  found: CaseRow,
  completedAt: Date,
) {
  const afterCase = await findCaseById(caseId);
  const memo = await getInterviewAnswerMemo(caseId);
  const answersMap = parseStoredAnswers(memo?.content);

  return {
    completed: true as const,
    caseId,
    status: afterCase?.status ?? found.status,
    completedAt: completedAt.toISOString(),
    summary: buildInterviewSummary(
      found.title,
      found.category,
      interviewAnswerMapToSummaryRows(answersMap),
    ),
    allowedLifecycleActions: afterCase
      ? getAllowedLifecycleActionsForCase(afterCase.status, currentUser.role)
      : [],
  };
}

/**
 * `Interview` 행 `COMPLETED`·`answersJson`·활성 질문셋 메타(IV-05 / [330] A안 축, `getInterviewFlowInternal`과 동일).
 */
async function persistInterviewRowCompleted(
  caseId: string,
  completedAt: Date,
  activeQsRow: { id: string; code: string | null; version: string } | null,
) {
  const memo = await getInterviewAnswerMemo(caseId);
  const answersMap = parseStoredAnswers(memo?.content);
  const answersJson = answersMap as Prisma.InputJsonValue;
  const qsPersist = activeQsRow
    ? {
        questionSetId: activeQsRow.id,
        questionSetCode: activeQsRow.code,
        questionSetVersion: activeQsRow.version,
      }
    : {
        questionSetId: null as string | null,
        questionSetCode: null as string | null,
        questionSetVersion: null as string | null,
      };

  const latestInterview = await prisma.interview.findFirst({
    where: { caseId },
    orderBy: { createdAt: "desc" },
  });

  if (latestInterview) {
    await prisma.interview.update({
      where: { id: latestInterview.id },
      data: {
        status: "COMPLETED",
        completedAt,
        answersJson,
        ...qsPersist,
      },
    });
  } else {
    await prisma.interview.create({
      data: {
        caseId,
        status: "COMPLETED",
        completedAt,
        answersJson,
        ...qsPersist,
      },
    });
  }
}

export async function completeCaseInterviewService(
  currentUser: SessionUser,
  caseId: string,
) {
  await assertCaseInterviewAccess(currentUser, caseId);
  const access = await getCaseAccessContext(currentUser, caseId);

  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  assertCaseTerminalAllowsInterviewComplete(found.status);

  const activeQsRow = await resolveInterviewQuestionSetPersistRow(caseId);

  const existingCompletion = await findInterviewCompletionByCaseId(caseId);

  if (existingCompletion) {
    if (found.status === "CREATED" || found.status === "INTAKE_PENDING") {
      throw new ValidationError(
        "인터뷰 완료 기록은 있으나 사건 단계가 맞지 않습니다. 운영자에게 문의하세요.",
      );
    }
    if (found.status === "IN_INTERVIEW") {
      const completedAt = existingCompletion.createdAt;
      await prisma.$transaction(async (tx) => {
        await tx.case.update({
          where: { id: caseId },
          data: { status: "INTERVIEW_DONE" },
        });
        await tx.caseTimelineEvent.create({
          data: {
            caseId,
            type: "CASE_STATUS_CHANGED",
            title: `사건 상태 변경: ${found.status} → INTERVIEW_DONE`,
            description: null,
            metaJson: {
              action: "COMPLETE_INTERVIEW",
              from: found.status,
              to: "INTERVIEW_DONE",
              reason: null,
              source: "interview_complete",
            },
            actorUserId: currentUser.id,
          },
        });
      });
      await persistInterviewRowCompleted(caseId, completedAt, activeQsRow);
      return buildCompleteInterviewServiceResponse(
        currentUser,
        caseId,
        found,
        completedAt,
      );
    }
    return buildCompleteInterviewServiceResponse(
      currentUser,
      caseId,
      found,
      existingCompletion.createdAt,
    );
  }

  assertInInterviewForNewComplete(found.status);

  const flow = await getInterviewFlowInternal(caseId, access, currentUser);
  const missingRequired = flow.visibleQuestions.filter((q) => q.required && !q.isAnswered);

  if (missingRequired.length > 0) {
    throw new ValidationError(
      `필수 질문 응답이 부족합니다. 미완료 항목: ${missingRequired.map((item) => item.label).join(", ")}`,
    );
  }

  const completion = await markInterviewCompleted({
    caseId,
    authorUserId: currentUser.id,
  });
  const completionCreatedAt = completion.createdAt;

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_INTERVIEW_COMPLETE",
    entityType: "CASE",
    entityId: caseId,
    message: "사건 인터뷰 완료 처리",
    metadata: { completionMemoId: completion.id },
  });

  const completedAt = completionCreatedAt;

  await prisma.$transaction(async (tx) => {
    await tx.case.update({
      where: { id: caseId },
      data: { status: "INTERVIEW_DONE" },
    });
    await tx.caseTimelineEvent.create({
      data: {
        caseId,
        type: "CASE_STATUS_CHANGED",
        title: `사건 상태 변경: ${found.status} → INTERVIEW_DONE`,
        description: null,
        metaJson: {
          action: "COMPLETE_INTERVIEW",
          from: found.status,
          to: "INTERVIEW_DONE",
          reason: null,
          source: "interview_complete",
        },
        actorUserId: currentUser.id,
      },
    });
  });
  await persistInterviewRowCompleted(caseId, completedAt, activeQsRow);

  return buildCompleteInterviewServiceResponse(
    currentUser,
    caseId,
    found,
    completedAt,
  );
}
