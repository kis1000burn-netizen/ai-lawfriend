import { z } from "zod";

export const voiceLawyerSupplementQuestionBodySchema = z
  .object({
    questionKey: z.string().trim().min(1, "questionKey가 필요합니다."),
    questionLabel: z.string().trim().max(200).optional(),
    itemPrompt: z.string().trim().max(5000).optional(),
    sendImmediately: z.boolean().default(true),
  })
  .strict();

export type VoiceLawyerSupplementQuestionBody = z.infer<
  typeof voiceLawyerSupplementQuestionBodySchema
>;
