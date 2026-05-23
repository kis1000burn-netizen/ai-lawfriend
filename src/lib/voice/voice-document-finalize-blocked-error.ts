import { AppError } from "@/lib/errors";
import { VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES } from "@/lib/voice/voice-document-finalize-gate-ui";
import type { VoiceReviewBlockReason } from "@/lib/voice/voice-lawyer-review-ux-policy";

export class VoiceDocumentFinalizeBlockedError extends AppError {
  public readonly blockReason: VoiceReviewBlockReason;
  public readonly questionKey: string;
  public readonly supplementRequestId?: string;

  constructor(
    blockReason: VoiceReviewBlockReason,
    questionKey: string,
    options?: { supplementRequestId?: string },
  ) {
    super(VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES[blockReason], 403, blockReason, {
      blockReason,
      questionKey,
      supplementRequestId: options?.supplementRequestId,
      gate: "document finalize",
    });
    this.name = "VoiceDocumentFinalizeBlockedError";
    this.blockReason = blockReason;
    this.questionKey = questionKey;
    this.supplementRequestId = options?.supplementRequestId;
  }
}
