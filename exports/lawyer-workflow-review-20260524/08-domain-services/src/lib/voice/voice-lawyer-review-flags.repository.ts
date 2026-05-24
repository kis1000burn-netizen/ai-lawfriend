/**
 * Phase 5-H-UI-3 — 변호사 음성 검토 완료 플래그 영속화.
 * Prisma model: VoiceLawyerReviewCompletion
 */
import { VoiceTranscriptStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** Phase 5-H-UI-3 — 검토 완료 플래그 repository 정적 마커 */
export const PHASE5H_UI_3_VOICE_LAWYER_REVIEW_FLAGS_REPOSITORY_LOCK =
  "phase5h-ui-3-voice-lawyer-review-flags-repository" as const;

type LatestConfirmedTranscript = {
  questionKey: string;
  id: string;
};

export function resolveLawyerVoiceReviewFlags(input: {
  completions: Array<{ questionKey: string; voiceTranscriptId: string }>;
  latestConfirmedByQuestionKey: Map<string, LatestConfirmedTranscript>;
}): Record<string, boolean> {
  const completionByKey = new Map(input.completions.map((row) => [row.questionKey, row]));
  const flags: Record<string, boolean> = {};

  for (const [questionKey, latest] of input.latestConfirmedByQuestionKey) {
    const completion = completionByKey.get(questionKey);
    flags[questionKey] = Boolean(
      completion && completion.voiceTranscriptId === latest.id,
    );
  }

  return flags;
}

export async function loadLawyerVoiceReviewFlagsByCaseId(
  caseId: string,
): Promise<Record<string, boolean>> {
  const [completions, transcripts] = await Promise.all([
    prisma.voiceLawyerReviewCompletion.findMany({
      where: { caseId },
      select: { questionKey: true, voiceTranscriptId: true },
    }),
    prisma.voiceTranscript.findMany({
      where: { caseId, status: VoiceTranscriptStatus.CONFIRMED },
      orderBy: { createdAt: "desc" },
      select: { id: true, questionKey: true },
    }),
  ]);

  const latestConfirmedByQuestionKey = new Map<string, LatestConfirmedTranscript>();
  for (const row of transcripts) {
    if (!latestConfirmedByQuestionKey.has(row.questionKey)) {
      latestConfirmedByQuestionKey.set(row.questionKey, {
        questionKey: row.questionKey,
        id: row.id,
      });
    }
  }

  return resolveLawyerVoiceReviewFlags({
    completions,
    latestConfirmedByQuestionKey,
  });
}

export async function invalidateVoiceLawyerReviewForQuestion(
  caseId: string,
  questionKey: string,
): Promise<void> {
  await prisma.voiceLawyerReviewCompletion.deleteMany({
    where: { caseId, questionKey },
  });
}
