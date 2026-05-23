import { z } from "zod";

export const caseIntelligenceJudgmentBodySchema = z
  .object({
    entryId: z.string().min(1),
    judgmentState: z.enum(["CONFIRMED", "REJECTED", "EDITED"]),
    lawyerEditedText: z.string().max(4000).optional(),
    rejectionReason: z.string().max(500).optional(),
    clientVisible: z.boolean().optional(),
    submissionReady: z.boolean().optional(),
  })
  .superRefine((body, ctx) => {
    if (body.judgmentState === "EDITED" && !body.lawyerEditedText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "EDITED judgment requires lawyerEditedText",
        path: ["lawyerEditedText"],
      });
    }
    if (body.judgmentState === "REJECTED" && !body.rejectionReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "REJECTED judgment requires rejectionReason",
        path: ["rejectionReason"],
      });
    }
  });

export type CaseIntelligenceJudgmentBody = z.infer<typeof caseIntelligenceJudgmentBodySchema>;
