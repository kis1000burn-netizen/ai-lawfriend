import {
  SupplementRequestStatus,
  SupplementRequestType,
  VoiceTranscriptStatus,
} from "@prisma/client";

import { saveInterviewAnswer } from "@/features/case-interview/case-interview.service";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  appendSupplementRequestAuditLogRepository,
  appendSupplementRequestStatusLogRepository,
  createSupplementRequestItemRepository,
  createSupplementRequestRepository,
  findSupplementRequestByIdRepository,
  updateSupplementRequestRepository,
} from "@/features/supplement-request/supplement-request.repository";
import type { VoiceLawyerSupplementQuestionBody } from "@/features/voice/voice-lawyer-supplement.api.validators";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

/** Phase 5-H-UI-4 — Voice lawyer review → Supplement question 서비스 마커 */
export const VOICE_LAWYER_SUPPLEMENT_SERVICE_MARKER_PHASE5H_UI_4 =
  "phase5h-ui-4-voice-lawyer-supplement-question" as const;

/** SupplementRequestItem.sourceMarker — Voice 검토 패널 출처 */
export const VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER =
  "phase5h-ui-4-voice-lawyer-review-supplement" as const;

function canCreateVoiceLawyerSupplement(user: SessionUser): boolean {
  return user.role === "LAWYER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN";
}

export function buildVoiceLawyerSupplementItemPrompt(input: {
  questionLabel: string;
  customPrompt?: string;
}): string {
  if (input.customPrompt?.trim()) {
    return input.customPrompt.trim();
  }
  return [
    "음성으로 답변하신 내용을 다시 확인해 주세요.",
    `질문: ${input.questionLabel}`,
    "확정 transcript와 현재 인터뷰 답변이 다를 수 있습니다. 정확한 내용을 텍스트로 보완해 주세요.",
  ].join("\n");
}

export function buildVoiceLawyerSupplementDescription(questionLabel: string): string {
  return [
    "변호사가 음성 transcript 검토 중 요청한 보완 질문입니다.",
    `대상 인터뷰 질문: ${questionLabel}`,
    "의뢰인 보완 응답은 수용(ACCEPTED) 후 해당 인터뷰 답변에 반영됩니다.",
  ].join("\n");
}

async function findLatestConfirmedVoiceTranscript(caseId: string, questionKey: string) {
  return prisma.voiceTranscript.findFirst({
    where: {
      caseId,
      questionKey,
      status: VoiceTranscriptStatus.CONFIRMED,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
}

export async function createVoiceLawyerSupplementQuestion(
  user: SessionUser,
  caseId: string,
  input: VoiceLawyerSupplementQuestionBody,
) {
  if (!canCreateVoiceLawyerSupplement(user)) {
    throw new ForbiddenError("보완 질문 생성은 변호사 또는 관리자만 가능합니다.");
  }

  const access = await getCaseAccessContext(user, caseId);
  if (!access.canWriteCase) {
    throw new ForbiddenError("보완 질문 생성 권한이 없습니다.");
  }

  const caseRow = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, ownerUserId: true, title: true },
  });
  if (!caseRow) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const questionKey = input.questionKey.trim();
  const questionLabel = input.questionLabel?.trim() || questionKey;
  const latestConfirmed = await findLatestConfirmedVoiceTranscript(caseId, questionKey);
  if (!latestConfirmed) {
    throw new ValidationError(
      "확정(CONFIRMED)된 음성 transcript가 있어야 보완 질문을 생성할 수 있습니다.",
      { code: "VOICE_SUPPLEMENT_REQUIRES_CONFIRMED_TRANSCRIPT" },
    );
  }

  const title = `음성 transcript 보완: ${questionLabel}`.slice(0, 120);
  const description = buildVoiceLawyerSupplementDescription(questionLabel);
  const itemPrompt = buildVoiceLawyerSupplementItemPrompt({
    questionLabel,
    customPrompt: input.itemPrompt,
  });

  const request = await createSupplementRequestRepository({
    caseId,
    requesterUserId: user.id,
    targetUserId: caseRow.ownerUserId,
    requestType: SupplementRequestType.UNCLEAR_FACT,
    title,
    description,
  });

  const item = await createSupplementRequestItemRepository({
    requestId: request.id,
    itemType: SupplementRequestType.UNCLEAR_FACT,
    itemLabel: questionLabel,
    itemPrompt,
    interviewQuestionKey: questionKey,
    voiceTranscriptId: latestConfirmed.id,
    sourceMarker: VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER,
  });

  await appendSupplementRequestAuditLogRepository({
    requestId: request.id,
    actionType: "CREATE",
    actorUserId: user.id,
    actorRole: user.role,
    actionSummary: "Voice lawyer review 보완 질문 생성",
    actionPayloadMasked: {
      source: VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER,
      questionKey,
      voiceTranscriptId: latestConfirmed.id,
      serviceMarker: VOICE_LAWYER_SUPPLEMENT_SERVICE_MARKER_PHASE5H_UI_4,
    },
  });

  let finalRequest = request;
  if (input.sendImmediately) {
    const now = new Date();
    finalRequest = await updateSupplementRequestRepository({
      requestId: request.id,
      status: SupplementRequestStatus.SENT,
      sentAt: now,
    });

    await appendSupplementRequestStatusLogRepository({
      requestId: request.id,
      fromStatus: SupplementRequestStatus.DRAFT,
      toStatus: SupplementRequestStatus.SENT,
      actorUserId: user.id,
      actorRole: user.role,
      reasonCode: "VOICE_LAWYER_REVIEW_SUPPLEMENT",
      reasonMemo: "Voice transcript 검토 보완 질문 자동 발송",
    });

    await appendSupplementRequestAuditLogRepository({
      requestId: request.id,
      actionType: "SEND",
      actorUserId: user.id,
      actorRole: user.role,
      actionSummary: "Voice lawyer review 보완 질문 발송",
      actionPayloadMasked: {
        source: VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER,
        questionKey,
      },
    });
  }

  return {
    supplementRequest: finalRequest,
    supplementItem: item,
    supplementHubPath: `/cases/${caseId}/supplement`,
    interviewPath: `/cases/${caseId}/interview`,
  };
}

export async function mergeVoiceSupplementItemsToInterviewOnAccepted(
  actor: SessionUser,
  caseId: string,
  requestId: string,
): Promise<{ mergedQuestionKeys: string[] }> {
  const request = await findSupplementRequestByIdRepository(requestId);
  if (!request || request.caseId !== caseId) {
    return { mergedQuestionKeys: [] };
  }

  const voiceItems = request.items.filter(
    (item) =>
      item.sourceMarker === VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER &&
      Boolean(item.interviewQuestionKey),
  );
  if (voiceItems.length === 0) {
    return { mergedQuestionKeys: [] };
  }

  const mergedQuestionKeys: string[] = [];

  for (const item of voiceItems) {
    const questionKey = item.interviewQuestionKey;
    if (!questionKey) continue;

    const latestResponse = request.responses.find(
      (response) => response.requestItemId === item.id && response.responseText?.trim(),
    );
    if (!latestResponse?.responseText?.trim()) continue;

    await saveInterviewAnswer(actor, {
      caseId,
      questionKey,
      value: latestResponse.responseText.trim(),
    });
    mergedQuestionKeys.push(questionKey);
  }

  return { mergedQuestionKeys };
}
