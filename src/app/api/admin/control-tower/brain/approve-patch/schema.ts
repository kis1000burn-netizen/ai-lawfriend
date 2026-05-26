import { z } from "zod";

export const brainApprovePatchInputSchema = z.object({
  planId: z.string().min(1),
});
