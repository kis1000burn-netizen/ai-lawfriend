import { z } from "zod";

export const legalReliabilityActionLoopCaseParamSchema = z.object({
  caseId: z.string().min(1),
});

export const legalReliabilityActionLoopSignalParamSchema = z.object({
  caseId: z.string().min(1),
  signalId: z.string().min(1),
});

export const legalReliabilityActionLoopCandidateParamSchema = z.object({
  caseId: z.string().min(1),
  candidateId: z.string().min(1),
});
