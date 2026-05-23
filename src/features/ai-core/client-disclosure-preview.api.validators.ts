import { z } from "zod";

export const clientDisclosureReleaseBodySchema = z.object({
  action: z.literal("RELEASE"),
  releaseNotes: z.string().max(500).optional(),
});

export type ClientDisclosureReleaseBody = z.infer<typeof clientDisclosureReleaseBodySchema>;
