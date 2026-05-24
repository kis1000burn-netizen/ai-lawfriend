/**
 * Product Phase 25-C — Operator training / admin playbook policy SSOT.
 */
import { OPERATOR_TRAINING_MODULES } from "./operator-training-admin-playbook.registry";
import type { OperatorTrainingAdminPlaybookResult } from "./operator-training-admin-playbook.schema";
import { OPERATOR_TRAINING_ADMIN_PLAYBOOK_VERSION } from "./operator-training-admin-playbook.schema";

export const OPERATOR_TRAINING_ADMIN_PLAYBOOK_POLICY_MARKER_PHASE25C =
  "phase25c-operator-training-admin-playbook-policy" as const;

export function assembleOperatorTrainingAdminPlaybook(input: {
  trainedModuleIds: Set<string>;
  generatedAt?: string;
}): OperatorTrainingAdminPlaybookResult {
  const modules = OPERATOR_TRAINING_MODULES.map((module) => ({
    ...module,
    trained: input.trainedModuleIds.has(module.moduleId),
  }));

  const required = modules.filter((module) => module.required);
  const trainedRequired = required.filter((module) => module.trained).length;
  const trainingCompletionRate =
    required.length === 0 ? 100 : Math.round((trainedRequired / required.length) * 100);

  return {
    version: OPERATOR_TRAINING_ADMIN_PLAYBOOK_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    modules,
    trainingCompletionRate,
    operatorReady: trainedRequired === required.length,
  };
}
