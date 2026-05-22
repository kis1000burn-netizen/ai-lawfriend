import { VoiceTranscriptStatus } from "@prisma/client";

import { ValidationError } from "@/lib/errors";

/** 인터뷰 답변(`Interview.answersJson`)에는 `CONFIRMED` transcript 문자열만 반영해야 한다(Phase 5-B). */
export function assertVoiceTranscriptConfirmedForInterviewBinding(status: VoiceTranscriptStatus): void {
  if (status !== VoiceTranscriptStatus.CONFIRMED) {
    throw new ValidationError(
      `Voice transcript must be CONFIRMED before binding to interview answer (current: ${status}).`,
    );
  }
}
