import { z } from "zod";

export const PHASE60D_PATCH_PLAN_VERSION = "60-D.1" as const;
export const PHASE60D_PATCH_PLAN_MARKER = "phase60d-patch-plan-v1" as const;

export const brainPatchRiskLevelSchema = z.enum(["SAFE", "REVIEW_REQUIRED", "BLOCKED"]);

export const brainPatchPlanSchema = z.object({
  planId: z.string().min(1),
  issueId: z.string().min(1),
  diagnosisId: z.string().optional(),
  riskLevel: brainPatchRiskLevelSchema,
  filesToChange: z.array(z.string()),
  proposedChanges: z.array(
    z.object({
      file: z.string(),
      reason: z.string(),
      changeSummary: z.string(),
    }),
  ),
  testPlan: z.array(z.string()).min(1),
  rollbackPlan: z.array(z.string()).min(1),
  requiresHumanApproval: z.boolean(),
  approved: z.boolean().default(false),
  approvedAt: z.string().datetime().optional(),
  approvedByUserId: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type BrainPatchPlan = z.infer<typeof brainPatchPlanSchema>;

export const brainPatchPlanInputSchema = z.object({
  issueIds: z.array(z.string()).optional(),
  diagnosisIds: z.array(z.string()).optional(),
});

export const brainPatchPlanResultSchema = z.object({
  marker: z.literal(PHASE60D_PATCH_PLAN_MARKER),
  version: z.literal(PHASE60D_PATCH_PLAN_VERSION),
  generatedAt: z.string().datetime(),
  plans: z.array(brainPatchPlanSchema),
});

export type BrainPatchPlanResult = z.infer<typeof brainPatchPlanResultSchema>;
