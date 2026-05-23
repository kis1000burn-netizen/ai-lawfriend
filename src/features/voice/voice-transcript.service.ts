import { VoiceInteractionTraceEvent, VoiceTranscriptStatus, type Prisma } from "@prisma/client";

import type { SessionUser } from "@/lib/auth/require-session-user";
import {
  getInterviewFlow,
  saveInterviewAnswer,
} from "@/features/case-interview/case-interview.service";
import { canPerformCaseInterview, getCaseAccessContext } from "@/features/cases/case.permissions";
import type { InterviewFlowPayload } from "@/features/question-set/question-set.types";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { computeVoiceTranscriptDraftExpiresAt } from "@/lib/voice/voice-transcript-policy";
import { invalidateVoiceLawyerReviewForQuestion } from "@/lib/voice/voice-lawyer-review-flags.repository";

/** Phase 5-D — 라우트/검증 스크립트 정적 마커 */
export const VOICE_PHASE5_D_SERVICE_MARKER = "phase5-d-stt-confirm-interview-binding";

async function assertCaseVoiceInterviewAccess(user: SessionUser, caseId: string) {
  const access = await getCaseAccessContext(user, caseId);
  if (!canPerformCaseInterview(access)) {
    throw new ForbiddenError("인터뷰 접근 권한이 없습니다.");
  }
}

function assertQuestionKeyAllowedForVoice(flow: InterviewFlowPayload, questionKey: string) {
  const allowed = new Set(flow.visibleQuestions.map((q) => q.key));
  if (!allowed.has(questionKey)) {
    throw new ValidationError("현재 인터뷰에서 허용되지 않은 질문 키입니다.", {
      code: "VOICE_QUESTION_KEY_NOT_VISIBLE",
      details: { questionKey },
    });
  }
}

async function appendVoiceTrace(
  tx: Prisma.TransactionClient,
  input: {
    caseId: string;
    voiceTranscriptId: string;
    event: VoiceInteractionTraceEvent;
    actorUserId: string;
    payloadJson?: Prisma.InputJsonValue;
  },
) {
  return tx.voiceInteractionTrace.create({
    data: {
      caseId: input.caseId,
      voiceTranscriptId: input.voiceTranscriptId,
      event: input.event,
      actorUserId: input.actorUserId,
      payloadJson: input.payloadJson ?? undefined,
    },
  });
}

export type CreateVoiceTranscriptFromSttInput = {
  caseId: string;
  questionKey: string;
  sttDraftText: string;
  storeOriginalAudio?: boolean;
  originalAudioStorageKey?: string | null;
};

/**
 * 클라이언트·게이트웨이 STT 이후 초안 행 저장 + trace `VOICE_TRANSCRIPT_CREATED`.
 * 상태는 곧바로 `NEEDS_CONFIRMATION`(확정 UI 대기).
 */
export async function createVoiceTranscriptFromSttCapture(
  user: SessionUser,
  input: CreateVoiceTranscriptFromSttInput,
) {
  await assertCaseVoiceInterviewAccess(user, input.caseId);
  const flow = await getInterviewFlow(user, input.caseId);
  assertQuestionKeyAllowedForVoice(flow, input.questionKey);

  const draft = input.sttDraftText.trim();
  if (!draft) {
    throw new ValidationError("STT 초안 문자열이 비어 있습니다.", { code: "VOICE_STT_EMPTY" });
  }

  const expiresAt = computeVoiceTranscriptDraftExpiresAt(new Date());

  const storeAudio = Boolean(input.storeOriginalAudio);
  const audioKey =
    storeAudio && input.originalAudioStorageKey && input.originalAudioStorageKey.trim().length > 0
      ? input.originalAudioStorageKey.trim()
      : null;

  const interviewRow = await prisma.interview.findFirst({
    where: { caseId: input.caseId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  return prisma.$transaction(async (tx) => {
    const row = await tx.voiceTranscript.create({
      data: {
        caseId: input.caseId,
        questionKey: input.questionKey,
        createdByUserId: user.id,
        interviewId: interviewRow?.id ?? undefined,
        status: VoiceTranscriptStatus.NEEDS_CONFIRMATION,
        draftText: draft,
        storeOriginalAudio: storeAudio,
        originalAudioStorageKey: audioKey,
        expiresAt,
      },
    });

    await appendVoiceTrace(tx, {
      caseId: input.caseId,
      voiceTranscriptId: row.id,
      event: VoiceInteractionTraceEvent.VOICE_TRANSCRIPT_CREATED,
      actorUserId: user.id,
      payloadJson: {
        phase5DMarker: VOICE_PHASE5_D_SERVICE_MARKER,
        questionKey: input.questionKey,
        expiresAtIso: expiresAt.toISOString(),
      },
    });

    return row;
  });
}

function isDraftExpired(expiresAt: Date | null, status: VoiceTranscriptStatus) {
  if (!expiresAt) return false;
  if (status !== VoiceTranscriptStatus.NEEDS_CONFIRMATION) return false;
  return expiresAt.getTime() < Date.now();
}

export async function confirmVoiceTranscriptAndBindInterviewAnswer(
  user: SessionUser,
  caseId: string,
  transcriptId: string,
  confirmedTextInput?: string,
) {
  await assertCaseVoiceInterviewAccess(user, caseId);

  const row = await prisma.voiceTranscript.findFirst({
    where: { id: transcriptId, caseId },
  });
  if (!row) {
    throw new NotFoundError("음성 초안 transcript 를 찾을 수 없습니다.");
  }

  if (
    row.status !== VoiceTranscriptStatus.NEEDS_CONFIRMATION &&
    row.status !== VoiceTranscriptStatus.CAPTURED
  ) {
    if (row.status === VoiceTranscriptStatus.CONFIRMED) {
      throw new ConflictError("이미 확정된 transcript 입니다.", { transcriptId });
    }
    throw new ValidationError(`확정할 수 없는 transcript 상태입니다 (${row.status}).`, {
      code: "VOICE_TRANSCRIPT_INVALID_STATE",
      details: { status: row.status },
    });
  }

  const draftTrim = row.draftText?.trim() ?? "";
  const confirmedTrim = confirmedTextInput?.trim() ?? "";
  const resolved = confirmedTrim.length > 0 ? confirmedTrim : draftTrim;
  if (!resolved) {
    throw new ValidationError("확정할 문자열이 없습니다. 수정 문구를 입력하거나 STT 결과를 채워 주세요.", {
      code: "VOICE_CONFIRM_EMPTY",
    });
  }

  if (isDraftExpired(row.expiresAt, row.status)) {
    throw new ValidationError(
      "transcript 초안 TTL 이 만료되었습니다. 음성을 다시 진행해 주세요.",
      { code: "VOICE_TRANSCRIPT_EXPIRED" },
    );
  }

  const flow = await getInterviewFlow(user, caseId);
  assertQuestionKeyAllowedForVoice(flow, row.questionKey);

  await prisma.$transaction(async (tx) => {
    await tx.voiceTranscript.update({
      where: { id: row.id },
      data: {
        status: VoiceTranscriptStatus.CONFIRMED,
        draftText: resolved,
        confirmedAt: new Date(),
      },
    });

    await tx.voiceLawyerReviewCompletion.deleteMany({
      where: { caseId, questionKey: row.questionKey },
    });

    await appendVoiceTrace(tx, {
      caseId,
      voiceTranscriptId: row.id,
      event: VoiceInteractionTraceEvent.VOICE_TRANSCRIPT_CONFIRMED,
      actorUserId: user.id,
      payloadJson: {
        phase5DMarker: VOICE_PHASE5_D_SERVICE_MARKER,
        questionKey: row.questionKey,
        snippetLength: resolved.length,
      },
    });
  });

  /** `CONFIRMED` 전에는 인터뷰 저장이 호출되지 않도록 위 트랜잭션 이후만 실행된다(Phase 5-D). */
  await saveInterviewAnswer(user, {
    caseId,
    questionKey: row.questionKey,
    value: resolved,
  });

  await prisma.voiceInteractionTrace.create({
    data: {
      caseId,
      voiceTranscriptId: row.id,
      event: VoiceInteractionTraceEvent.VOICE_INTERVIEW_ANSWER_BOUND,
      actorUserId: user.id,
      payloadJson: {
        phase5DMarker: VOICE_PHASE5_D_SERVICE_MARKER,
        questionKey: row.questionKey,
      },
    },
  });

  return prisma.voiceTranscript.findUniqueOrThrow({
    where: { id: row.id },
  });
}

export async function rejectVoiceTranscriptDraft(user: SessionUser, caseId: string, transcriptId: string) {
  await assertCaseVoiceInterviewAccess(user, caseId);

  const row = await prisma.voiceTranscript.findFirst({
    where: { id: transcriptId, caseId },
  });
  if (!row) {
    throw new NotFoundError("음성 초안 transcript 를 찾을 수 없습니다.");
  }

  if (row.status !== VoiceTranscriptStatus.NEEDS_CONFIRMATION) {
    if (row.status === VoiceTranscriptStatus.REJECTED) {
      throw new ConflictError("이미 거절 처리된 transcript 입니다.", { transcriptId });
    }
    throw new ValidationError(`거절할 수 없는 transcript 상태입니다 (${row.status}).`, {
      code: "VOICE_REJECT_INVALID_STATE",
    });
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.voiceTranscript.update({
      where: { id: row.id },
      data: {
        status: VoiceTranscriptStatus.REJECTED,
        rejectedAt: now,
      },
    });

    await tx.voiceLawyerReviewCompletion.deleteMany({
      where: { caseId, questionKey: row.questionKey },
    });

    await appendVoiceTrace(tx, {
      caseId,
      voiceTranscriptId: row.id,
      event: VoiceInteractionTraceEvent.VOICE_TRANSCRIPT_REJECTED,
      actorUserId: user.id,
      payloadJson: {
        phase5DMarker: VOICE_PHASE5_D_SERVICE_MARKER,
        questionKey: row.questionKey,
      },
    });
  });

  return prisma.voiceTranscript.findUniqueOrThrow({ where: { id: row.id } });
}
