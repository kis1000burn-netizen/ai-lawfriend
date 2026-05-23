import { z } from "zod";
import { AIBEOPCHIN_CMB_STATUSES } from "@/cmb/core/cmb-schema";

export const cmbRevisionTransitionBodySchema = z.object({
  toStatus: z.enum(AIBEOPCHIN_CMB_STATUSES),
  changeReason: z.string().trim().max(2000).optional(),
  evidenceTag: z.string().trim().max(200).optional(),
});

export type CmbRevisionTransitionBody = z.infer<typeof cmbRevisionTransitionBodySchema>;
