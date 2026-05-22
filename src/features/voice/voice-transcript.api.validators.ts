import { z } from "zod";

/** STT(또는 클라이언트 STT) 결과를 초안 transcript로 적재 — 원시 오디오 업로드는 별도 Phase. */
export const voiceSttCaptureBodySchema = z
  .object({
    questionKey: z.string().min(1, "questionKey가 필요합니다."),
    sttDraftText: z.string().min(1, "STT 초안 문자열이 필요합니다."),
    storeOriginalAudio: z.boolean().optional(),
    originalAudioStorageKey: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.originalAudioStorageKey && !val.storeOriginalAudio) {
      ctx.addIssue({
        code: "custom",
        message: "originalAudioStorageKey 는 storeOriginalAudio 가 true 일 때만 허용됩니다.",
        path: ["originalAudioStorageKey"],
      });
    }
  });

export type VoiceSttCaptureBody = z.infer<typeof voiceSttCaptureBodySchema>;

export const voiceTranscriptConfirmBodySchema = z
  .object({
    /** 미전달 시 `VoiceTranscript.draftText`(trim) 사용 */
    confirmedText: z.string().min(1).optional(),
  })
  .strict();

export type VoiceTranscriptConfirmBody = z.infer<typeof voiceTranscriptConfirmBodySchema>;
