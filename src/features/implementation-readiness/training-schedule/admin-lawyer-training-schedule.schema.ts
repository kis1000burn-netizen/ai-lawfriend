/**
 * Product Phase 36-C — Admin / lawyer training schedule schema (Zod SSOT).
 */
import { z } from "zod";

export const ADMIN_LAWYER_TRAINING_SCHEMA_MARKER_PHASE36C =
  "phase36c-admin-lawyer-training-schema" as const;

export const ADMIN_LAWYER_TRAINING_VERSION = "36-C.1" as const;

export const ADMIN_LAWYER_TRAINING_MODULE_IDS = [
  "ADMIN_ONBOARDING",
  "LAWYER_WORKFLOW_TRAINING",
  "CASE_INTAKE_TRAINING",
  "DOCUMENT_WORKFLOW_TRAINING",
  "SUPPORT_ESCALATION_TRAINING",
] as const;

export const adminLawyerTrainingModuleSchema = z.object({
  moduleId: z.enum(ADMIN_LAWYER_TRAINING_MODULE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const adminLawyerTrainingScheduleResultSchema = z.object({
  version: z.literal(ADMIN_LAWYER_TRAINING_VERSION),
  implementationScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  modules: z.array(adminLawyerTrainingModuleSchema).min(1),
  completionRate: z.number().min(0).max(100),
  adminLawyerTrainingReady: z.boolean(),
});

export type AdminLawyerTrainingModuleId = (typeof ADMIN_LAWYER_TRAINING_MODULE_IDS)[number];
export type AdminLawyerTrainingScheduleResult = z.infer<
  typeof adminLawyerTrainingScheduleResultSchema
>;
