import { z } from "zod";

export const PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_VERSION = "60-A.1" as const;

export const PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_MARKER =
  "phase60a-control-tower-brain-safety-v1" as const;

export const brainSafetyBoundarySchema = z.enum([
  "NO_UNAPPROVED_PRODUCTION_CODE_WRITE",
  "NO_DESTRUCTIVE_DB_CHANGE_BY_AI",
  "NO_AUTO_LEGAL_LOGIC_CHANGE_WITHOUT_REVIEW",
  "NO_SECRET_ACCESS_BY_AI",
  "NO_CLIENT_DATA_EXFILTRATION",
  "NO_AUTO_DEPLOY_TO_PRODUCTION",
  "NO_PATCH_WITHOUT_TEST_PLAN",
  "NO_FIX_WITHOUT_ROLLBACK_PLAN",
  "AUDIT_EVERY_BRAIN_DECISION",
]);

export type BrainSafetyBoundary = z.infer<typeof brainSafetyBoundarySchema>;

export const brainSafetyPolicySchema = z.object({
  marker: z.literal(PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_MARKER),
  version: z.literal(PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_VERSION),
  oneLineStandard: z.string().min(1),
  boundaries: z.array(brainSafetyBoundarySchema).min(1),
});

export type BrainSafetyPolicy = z.infer<typeof brainSafetyPolicySchema>;
