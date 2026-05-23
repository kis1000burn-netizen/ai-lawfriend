import { z } from "zod";

export const voiceLawyerReviewMutationBodySchema = z
  .object({
    questionKey: z.string().trim().min(1),
    reviewed: z.boolean(),
  })
  .strict();

export type VoiceLawyerReviewMutationBody = z.infer<typeof voiceLawyerReviewMutationBodySchema>;
