/**
 * Product Phase 25-C — Operator training / admin playbook schema (Zod SSOT).
 */
import { z } from "zod";

export const OPERATOR_TRAINING_ADMIN_PLAYBOOK_SCHEMA_MARKER_PHASE25C =
  "phase25c-operator-training-admin-playbook-schema" as const;

export const OPERATOR_TRAINING_ADMIN_PLAYBOOK_VERSION = "25-C.1" as const;

export const operatorPlaybookModuleSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(1),
  adminPath: z.string().optional(),
  runbookPath: z.string().optional(),
  required: z.boolean().default(true),
  trained: z.boolean(),
});

export const operatorTrainingAdminPlaybookResultSchema = z.object({
  version: z.literal(OPERATOR_TRAINING_ADMIN_PLAYBOOK_VERSION),
  generatedAt: z.string().datetime(),
  modules: z.array(operatorPlaybookModuleSchema).min(1),
  trainingCompletionRate: z.number().min(0).max(100),
  operatorReady: z.boolean(),
});

export type OperatorTrainingAdminPlaybookResult = z.infer<
  typeof operatorTrainingAdminPlaybookResultSchema
>;
