import { writeAuditLog } from "@/lib/audit-log";
import { assertCaseDocumentDraftNotApprovalLocked } from "@/features/documents/document-paragraphs.service";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { findCaseById } from "@/features/cases/case.repository";
import {
  findInterviewAnswersByCaseId,
  findInterviewCompletionByCaseId,
} from "@/features/case-interview/case-interview.repository";
import { assertVoiceDocumentFinalizeAllowed } from "@/lib/voice/voice-document-finalize-gate.service";
import {
  buildInterviewSummary,
  getInterviewFlow,
} from "@/features/case-interview/case-interview.service";
import { buildPreviewBody } from "@/features/document-drafts/document-draft.compose";
import {
  buildDocumentDraftFromInterview,
  buildDraftPreviewFromDraft,
} from "@/features/document-drafts/document-draft.mapper";
import {
  createCaseDocumentDraft,
  findCaseDocumentDraftById,
  findCaseDocuments,
} from "@/features/document-drafts/document-draft.repository";
import type {
  DraftDocumentParagraph,
  DraftPreviewResult,
  FinalizeDraftInput,
  ParagraphDiffLine,
  ParagraphRewriteHistoryItem,
  RegenerateParagraphInput,
  RegenerateParagraphResult,
} from "@/features/document-drafts/document-draft.types";
import { buildParagraphLineDiff } from "@/features/document-drafts/document-paragraph-diff.utils";
import { invokeDraftParagraphRegenerateBatch } from "@/features/ai-core";
import {
  createParagraphRewriteHistoryRepository,
  findParagraphRewriteHistoryById,
} from "@/features/document-drafts/document-paragraph-history.repository";
import type {
  CreateDocumentDraftInput,
  DocumentDraftType,
} from "@/features/document-drafts/document-draft.validators";
import type {
  DocumentTemplateType,
  QuestionSetQuestion,
  ResolvedInterviewQuestion,
} from "@/features/question-set/question-set.types";

function defaultDocumentTitle(type: DocumentDraftType, caseTitle: string) {
  switch (type) {
    case "fact_sheet":
      return `${caseTitle} 사실관계 정리서 초안`;
    case "statement":
      return `${caseTitle} 진술서 초안`;
    case "consultation_qna":
      return `${caseTitle} 상담 전 질문 목록`;
    case "overview":
      return `${caseTitle} 사건 개요서`;
    case "evidence_list":
      return `${caseTitle} 증거 정리표`;
    case "interview_mapped":
      return `${caseTitle} 인터뷰 매핑 초안`;
    default:
      return `${caseTitle} 문서 초안`;
  }
}

function toPlainQuestion(q: ResolvedInterviewQuestion): QuestionSetQuestion {
  const { isVisible, isAnswered, ...rest } = q;
  void isVisible;
  void isAnswered;
  return rest;
}

export async function previewDocumentDraftFromInterview(
  currentUser: SessionUser,
  caseId: string,
  templateType: DocumentTemplateType,
): Promise<DraftPreviewResult> {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!(access.isOwner || access.isAdmin || access.isAssignedLawyer)) {
    throw new ForbiddenError("문서 초안 생성 권한이 없습니다.");
  }

  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const interviewCompleted = await findInterviewCompletionByCaseId(caseId);
  if (!interviewCompleted) {
    throw new ValidationError("인터뷰 완료 후 문서 미리보기가 가능합니다.");
  }

  const flow = await getInterviewFlow(currentUser, caseId);

  const buildResult = buildDocumentDraftFromInterview({
    caseTitle: found.title,
    questionSetName: flow.questionSetName,
    templateType,
    visibleQuestions: flow.visibleQuestions.map(toPlainQuestion),
    answers: flow.answers,
  });

  return buildDraftPreviewFromDraft(buildResult);
}

export async function regenerateDraftParagraphs(
  currentUser: SessionUser,
  input: RegenerateParagraphInput,
): Promise<RegenerateParagraphResult> {
  const access = await getCaseAccessContext(currentUser, input.caseId);
  if (!(access.isOwner || access.isAdmin || access.isAssignedLawyer)) {
    throw new ForbiddenError("문서 초안 작업 권한이 없습니다.");
  }

  if (input.documentId?.trim()) {
    await assertCaseDocumentDraftNotApprovalLocked(input.documentId);
  }

  const aiResult = await invokeDraftParagraphRegenerateBatch({
    paragraphs: input.paragraphs,
    templateType: input.templateType,
    title: input.title,
    targetParagraphIds: input.targetParagraphIds,
    force: input.force,
    instructionByParagraphId: input.instructionByParagraphId,
    auditContext: {
      actorUserId: input.actorUserId ?? currentUser.id,
      caseId: input.caseId,
    },
  });

  const actorUserId = input.actorUserId ?? currentUser.id;

  for (const item of aiResult.historyDrafts) {
    await createParagraphRewriteHistoryRepository({
      caseId: input.caseId,
      documentId: input.documentId ?? null,
      paragraphId: item.paragraphId,
      sourceQuestionKey: item.sourceQuestionKey ?? null,
      templateType: input.templateType,
      title: input.title,
      beforeContent: item.beforeContent,
      afterContent: item.afterContent,
      instruction: item.instruction ?? null,
      aiModel: item.aiModel ?? null,
      status: "SUCCEEDED",
      actorUserId,
    });
  }

  return {
    title: input.title,
    templateType: input.templateType,
    paragraphs: aiResult.paragraphs,
    body: buildPreviewBody({
      templateType: input.templateType,
      paragraphs: aiResult.paragraphs,
    }),
    regeneratedIds: aiResult.regeneratedIds,
    skippedIds: aiResult.skippedIds,
  };
}

export async function finalizeDocumentDraft(
  currentUser: SessionUser,
  input: FinalizeDraftInput,
): Promise<{
  document: Awaited<ReturnType<typeof createCaseDocumentDraft>>;
  generated: {
    title: string;
    templateType: DocumentTemplateType;
    paragraphs: DraftDocumentParagraph[];
    body: string;
  };
}> {
  const access = await getCaseAccessContext(currentUser, input.caseId);
  if (!(access.isOwner || access.isAdmin || access.isAssignedLawyer)) {
    throw new ForbiddenError("문서 초안 생성 권한이 없습니다.");
  }

  const interviewCompleted = await findInterviewCompletionByCaseId(input.caseId);
  if (!interviewCompleted) {
    throw new ValidationError("인터뷰 완료 후 문서 최종 생성이 가능합니다.");
  }

  await assertVoiceDocumentFinalizeAllowed(input.caseId);

  const includedParagraphs = input.paragraphs.filter((paragraph) => paragraph.included);

  if (includedParagraphs.length === 0) {
    throw new ValidationError("최소 1개 이상의 문단을 포함해야 합니다.");
  }

  const body = buildPreviewBody({
    templateType: input.templateType,
    paragraphs: includedParagraphs,
  });

  const storedParagraphs: DraftDocumentParagraph[] = includedParagraphs.map((p) => {
    const { included, locked, aiHint, ...rest } = p;
    void included;
    void locked;
    void aiHint;
    return rest;
  });

  const title = input.title.trim() || "문서 초안";

  const created = await createCaseDocumentDraft({
    caseId: input.caseId,
    createdByUserId: currentUser.id,
    type: "interview_mapped",
    title,
    content: body,
    paragraphs: storedParagraphs,
    documentTemplateType: input.templateType,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_DOCUMENT_DRAFT_CREATE",
    entityType: "CASE_TIMELINE_MEMO",
    entityId: created.id,
    message: "문서 초안 최종 생성 (인터뷰 매핑)",
    metadata: {
      caseId: input.caseId,
      documentType: "interview_mapped",
      templateType: input.templateType,
    },
  });

  return {
    document: created,
    generated: {
      title,
      templateType: input.templateType,
      paragraphs: storedParagraphs,
      body,
    },
  };
}

function buildDocumentDraftContent(params: {
  type: DocumentDraftType;
  caseTitle: string;
  category: string | null | undefined;
  summary: ReturnType<typeof buildInterviewSummary>;
}) {
  const { type, caseTitle, category, summary } = params;

  if (type === "fact_sheet") {
    return [
      `제목: ${caseTitle} 사실관계 정리서`,
      "",
      "[사건 개요]",
      summary.overview || "-",
      "",
      "[타임라인]",
      ...(summary.timeline.length > 0
        ? summary.timeline.map((item, idx) => `${idx + 1}. ${item}`)
        : ["-"]),
      "",
      "[핵심 쟁점 후보]",
      ...(summary.keyIssues.length > 0
        ? summary.keyIssues.map((item, idx) => `${idx + 1}. ${item}`)
        : ["-"]),
      "",
      "[추가 확인 필요]",
      ...(summary.missingInfo.length > 0
        ? summary.missingInfo.map((item, idx) => `${idx + 1}. ${item}`)
        : ["-"]),
    ].join("\n");
  }

  if (type === "statement") {
    return [
      `제목: ${caseTitle} 진술서 초안`,
      "",
      `사건 유형: ${category ?? "-"}`,
      "",
      "[진술 개요]",
      summary.overview || "-",
      "",
      "[주요 사실관계]",
      ...(summary.timeline.length > 0
        ? summary.timeline.map((item, idx) => `${idx + 1}. ${item}`)
        : ["-"]),
      "",
      "[보완 필요사항]",
      ...(summary.missingInfo.length > 0
        ? summary.missingInfo.map((item, idx) => `${idx + 1}. ${item}`)
        : ["-"]),
      "",
      "※ 본 문서는 AI가 생성한 초안이며 최종 확정 전 변호사 검토가 필요합니다.",
    ].join("\n");
  }

  if (type === "consultation_qna") {
    return [
      `제목: ${caseTitle} 상담 전 질문 목록`,
      "",
      "[상담 전 체크포인트]",
      ...(summary.checklist.length > 0
        ? summary.checklist.map((item, idx) => `${idx + 1}. ${item}`)
        : ["-"]),
      "",
      "[쟁점 기반 질문]",
      ...(summary.keyIssues.length > 0
        ? summary.keyIssues.map(
            (item, idx) =>
              `${idx + 1}. ${item}와 관련해 추가 사실관계 확인 필요`,
          )
        : ["-"]),
      "",
      "[누락 정보 확인 질문]",
      ...(summary.missingInfo.length > 0
        ? summary.missingInfo.map((item, idx) => `${idx + 1}. ${item}`)
        : ["-"]),
    ].join("\n");
  }

  if (type === "overview") {
    return [
      `제목: ${caseTitle} 사건 개요서`,
      "",
      summary.overview || "-",
      "",
      "[핵심 쟁점 후보]",
      ...(summary.keyIssues.length > 0
        ? summary.keyIssues.map((item, idx) => `${idx + 1}. ${item}`)
        : ["-"]),
    ].join("\n");
  }

  return [
    `제목: ${caseTitle} 증거 정리표`,
    "",
    "[추가 확인 필요 자료]",
    ...(summary.missingInfo.length > 0
      ? summary.missingInfo.map((item, idx) => `${idx + 1}. ${item}`)
      : ["-"]),
    "",
    "[상담 전 체크포인트]",
    ...(summary.checklist.length > 0
      ? summary.checklist.map((item, idx) => `${idx + 1}. ${item}`)
      : ["-"]),
  ].join("\n");
}

export async function createDocumentDraftService(
  currentUser: SessionUser,
  caseId: string,
  input: CreateDocumentDraftInput,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!(access.isOwner || access.isAdmin || access.isAssignedLawyer)) {
    throw new ForbiddenError("문서 초안 생성 권한이 없습니다.");
  }

  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const interviewCompleted = await findInterviewCompletionByCaseId(caseId);
  if (!interviewCompleted) {
    throw new ValidationError("인터뷰 완료 후 문서 초안 생성이 가능합니다.");
  }

  const answers = await findInterviewAnswersByCaseId(caseId);
  if (answers.length === 0) {
    throw new ValidationError("인터뷰 답변이 없어 문서 초안을 생성할 수 없습니다.");
  }

  const summary = buildInterviewSummary(found.title, found.category, answers);
  const title = input.title?.trim() || defaultDocumentTitle(input.type, found.title);
  const content = buildDocumentDraftContent({
    type: input.type,
    caseTitle: found.title,
    category: found.category,
    summary,
  });

  const created = await createCaseDocumentDraft({
    caseId,
    createdByUserId: currentUser.id,
    type: input.type,
    title,
    content,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_DOCUMENT_DRAFT_CREATE",
    entityType: "CASE_TIMELINE_MEMO",
    entityId: created.id,
    message: "문서 초안 생성",
    metadata: {
      caseId,
      documentType: input.type,
    },
  });

  return {
    document: created,
    summary,
    generated: undefined,
  };
}

export async function listCaseDocumentDraftsService(
  currentUser: SessionUser,
  caseId: string,
) {
  await getCaseAccessContext(currentUser, caseId);

  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const documents = await findCaseDocuments(caseId);
  const answers = await findInterviewAnswersByCaseId(caseId);
  const summary = buildInterviewSummary(found.title, found.category, answers);
  const interviewCompleted = await findInterviewCompletionByCaseId(caseId);

  return {
    case: {
      id: found.id,
      title: found.title,
      category: found.category,
      status: found.status,
    },
    interviewCompleted: Boolean(interviewCompleted),
    documents,
    summary,
  };
}

export async function getCaseDocumentDraftService(
  currentUser: SessionUser,
  caseId: string,
  memoId: string,
) {
  await getCaseAccessContext(currentUser, caseId);

  const draft = await findCaseDocumentDraftById(caseId, memoId);
  if (!draft) {
    throw new NotFoundError("문서 초안을 찾을 수 없습니다.");
  }

  return draft;
}

export async function getParagraphRewriteDiff(
  currentUser: SessionUser,
  params: { caseId: string; historyId: string },
): Promise<{
  history: ParagraphRewriteHistoryItem;
  diffLines: ParagraphDiffLine[];
}> {
  const access = await getCaseAccessContext(currentUser, params.caseId);
  if (!(access.isOwner || access.isAdmin || access.isAssignedLawyer)) {
    throw new ForbiddenError("조회 권한이 없습니다.");
  }

  const history = await findParagraphRewriteHistoryById(params.historyId);
  if (!history || history.caseId !== params.caseId) {
    throw new NotFoundError("재생성 이력을 찾을 수 없습니다.");
  }

  const diffLines = buildParagraphLineDiff({
    beforeText: history.beforeContent,
    afterText: history.afterContent,
  });

  return { history, diffLines };
}
