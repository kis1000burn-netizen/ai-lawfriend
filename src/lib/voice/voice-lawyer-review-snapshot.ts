import type { VoiceTranscriptStatus } from "@prisma/client";

import type { LawyerVoiceReviewSnapshot } from "@/components/cases/lawyer-voice-review-panel";

export type VoiceTranscriptRowSnapshot = {
  questionKey: string;
  status: VoiceTranscriptStatus;
  draftText: string | null;
  confirmedAt: Date | null;
};

function mapTranscriptStatus(status: VoiceTranscriptStatus): LawyerVoiceReviewSnapshot["transcriptStatus"] {
  if (status === "CONFIRMED") return "CONFIRMED";
  if (status === "REJECTED") return "REJECTED";
  if (status === "CAPTURED" || status === "NEEDS_CONFIRMATION") return "DRAFT";
  return "NONE";
}

/** questionKey별 최신 VoiceTranscript 1건 + Interview answer → Lawyer 패널 스냅샷 */
export function buildLawyerVoiceReviewSnapshots(input: {
  transcripts: VoiceTranscriptRowSnapshot[];
  answers: Record<string, unknown>;
  questionLabels: Record<string, string>;
  lawyerReviewedByQuestionKey?: Record<string, boolean>;
}): LawyerVoiceReviewSnapshot[] {
  const reviewFlags = input.lawyerReviewedByQuestionKey ?? {};
  const latestByKey = new Map<string, VoiceTranscriptRowSnapshot>();
  for (const row of input.transcripts) {
    if (!latestByKey.has(row.questionKey)) {
      latestByKey.set(row.questionKey, row);
    }
  }

  const keys = new Set([...latestByKey.keys(), ...Object.keys(input.questionLabels)]);

  return [...keys].map((questionKey) => {
    const row = latestByKey.get(questionKey);
    if (!row) {
      return {
        questionKey,
        questionLabel: input.questionLabels[questionKey] ?? questionKey,
        transcriptStatus: "NONE" as const,
        interviewAnswer: input.answers[questionKey],
      };
    }

    const mappedStatus = mapTranscriptStatus(row.status);
    return {
      questionKey,
      questionLabel: input.questionLabels[questionKey] ?? questionKey,
      transcriptStatus: mappedStatus,
      sttDraftText: row.draftText,
      confirmedTranscriptText: mappedStatus === "CONFIRMED" ? row.draftText : null,
      interviewAnswer: input.answers[questionKey],
      lawyerReviewed: Boolean(reviewFlags[questionKey]),
    };
  });
}
