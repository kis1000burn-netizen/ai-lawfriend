import { VoiceTranscriptStatus } from "@prisma/client";

import type { SessionUser } from "@/lib/auth/require-session-user";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  invalidateVoiceLawyerReviewForQuestion,
  PHASE5H_UI_3_VOICE_LAWYER_REVIEW_FLAGS_REPOSITORY_LOCK,
} from "@/lib/voice/voice-lawyer-review-flags.repository";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

/** Phase 5-H-UI-3 — 변호사 검토 완료 서비스 마커 */
export const VOICE_LAWYER_REVIEW_SERVICE_MARKER_PHASE5H_UI_3 =
  "phase5h-ui-3-voice-lawyer-review-service" as const;

function canPersistLawyerVoiceReview(
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
): boolean {
  return access.isAdmin || access.isAssignedLawyer;
}

async function findLatestConfirmedVoiceTranscript(caseId: string, questionKey: string) {
  return prisma.voiceTranscript.findFirst({
    where: {
      caseId,
      questionKey,
      status: VoiceTranscriptStatus.CONFIRMED,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, questionKey: true },
  });
}

export async function setLawyerVoiceReviewCompletion(
  user: SessionUser,
  caseId: string,
  input: { questionKey: string; reviewed: boolean },
) {
  const access = await getCaseAccessContext(user, caseId);
  if (!canPersistLawyerVoiceReview(access)) {
    throw new ForbiddenError("변호사 음성 transcript 검토 완료를 저장할 권한이 없습니다.");
  }

  const questionKey = input.questionKey.trim();
  if (!questionKey) {
    throw new ValidationError("questionKey가 필요합니다.");
  }

  if (!input.reviewed) {
    await invalidateVoiceLawyerReviewForQuestion(caseId, questionKey);
    return { questionKey, reviewed: false as const };
  }

  const latestConfirmed = await findLatestConfirmedVoiceTranscript(caseId, questionKey);
  if (!latestConfirmed) {
    throw new ValidationError(
      "확정(CONFIRMED)된 음성 transcript가 있어야 검토 완료를 저장할 수 있습니다.",
      { code: "VOICE_LAWYER_REVIEW_REQUIRES_CONFIRMED_TRANSCRIPT" },
    );
  }

  const row = await prisma.voiceLawyerReviewCompletion.upsert({
    where: {
      caseId_questionKey: {
        caseId,
        questionKey,
      },
    },
    create: {
      caseId,
      questionKey,
      voiceTranscriptId: latestConfirmed.id,
      reviewedByUserId: user.id,
    },
    update: {
      voiceTranscriptId: latestConfirmed.id,
      reviewedByUserId: user.id,
      reviewedAt: new Date(),
    },
    select: {
      questionKey: true,
      voiceTranscriptId: true,
      reviewedAt: true,
    },
  });

  void PHASE5H_UI_3_VOICE_LAWYER_REVIEW_FLAGS_REPOSITORY_LOCK;

  return {
    questionKey: row.questionKey,
    reviewed: true as const,
    voiceTranscriptId: row.voiceTranscriptId,
    reviewedAt: row.reviewedAt.toISOString(),
  };
}
