/**
 * Product Phase 25-C — Operator training / admin playbook service.
 */
import { assembleOperatorTrainingAdminPlaybook } from "./operator-training-admin-playbook.policy";
import type { OperatorTrainingAdminPlaybookResult } from "./operator-training-admin-playbook.schema";

export const OPERATOR_TRAINING_ADMIN_PLAYBOOK_SERVICE_MARKER_PHASE25C =
  "phase25c-operator-training-admin-playbook-service" as const;

export function buildOperatorTrainingAdminPlaybook(input?: {
  trainedModuleIds?: string[];
}): OperatorTrainingAdminPlaybookResult {
  return assembleOperatorTrainingAdminPlaybook({
    trainedModuleIds: new Set(input?.trainedModuleIds ?? []),
  });
}
