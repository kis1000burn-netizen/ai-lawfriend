import { z } from "zod";
import { brainPatchPlanSchema } from "./phase60d-patch-plan.schema";

export const PHASE60E_SAFE_AUTO_FIX_VERSION = "60-E.1" as const;
export const PHASE60E_SAFE_AUTO_FIX_MARKER = "phase60e-safe-auto-fix-v1" as const;

export const brainSafeFixTypeSchema = z.enum([
  "DOCUMENT_CROSS_LINK",
  "NAVIGATOR_STATUS_SYNC",
  "PACKAGE_JSON_VERIFY_SCRIPT_REGISTER",
  "IMPORT_PATH_ALIGNMENT",
  "TEST_SNAPSHOT_MARKER",
  "TYPE_ALIGNMENT",
  "AUDIT_ONLY",
]);

export type BrainSafeFixType = z.infer<typeof brainSafeFixTypeSchema>;

export const brainAutoFixInputSchema = z.object({
  planId: z.string().min(1),
  dryRun: z.boolean().default(true),
});

export const brainApprovePatchInputSchema = z.object({
  planId: z.string().min(1),
});

export const brainAutoFixResultSchema = z.object({
  marker: z.literal(PHASE60E_SAFE_AUTO_FIX_MARKER),
  version: z.literal(PHASE60E_SAFE_AUTO_FIX_VERSION),
  planId: z.string(),
  executed: z.boolean(),
  dryRun: z.boolean(),
  fixType: brainSafeFixTypeSchema.optional(),
  message: z.string(),
  verificationCommands: z.array(z.string()),
  rollbackCommands: z.array(z.string()),
  auditAction: z.string(),
  plan: brainPatchPlanSchema.optional(),
});

export type BrainAutoFixResult = z.infer<typeof brainAutoFixResultSchema>;

export const brainBrainStatusSchema = z.object({
  marker: z.literal("control-tower-brain-status-v1"),
  health: z.enum(["OK", "ATTENTION", "CRITICAL"]),
  openIssueCount: z.number().int().nonnegative(),
  pendingApprovalCount: z.number().int().nonnegative(),
  safeAutoFixQueueCount: z.number().int().nonnegative(),
  lastScanAt: z.string().datetime().optional(),
  oneLineStandard: z.string(),
});

export type ControlTowerBrainStatus = z.infer<typeof brainBrainStatusSchema>;
