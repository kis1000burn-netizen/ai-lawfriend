/**
 * Product Phase 36-C — Admin / lawyer training schedule policy SSOT.
 */
import { ADMIN_LAWYER_TRAINING_MODULES } from "./admin-lawyer-training-schedule.registry";
import type { AdminLawyerTrainingScheduleResult } from "./admin-lawyer-training-schedule.schema";
import { ADMIN_LAWYER_TRAINING_VERSION } from "./admin-lawyer-training-schedule.schema";

export const ADMIN_LAWYER_TRAINING_POLICY_MARKER_PHASE36C =
  "phase36c-admin-lawyer-training-policy" as const;

export function assembleAdminLawyerTrainingSchedule(input: {
  implementationScopeSlug: string;
  definedModuleIds: Set<string>;
  generatedAt?: string;
}): AdminLawyerTrainingScheduleResult {
  const modules = ADMIN_LAWYER_TRAINING_MODULES.map((module) => ({
    ...module,
    defined: input.definedModuleIds.has(module.moduleId),
  }));

  const required = modules.filter((module) => module.required);
  const definedRequired = required.filter((module) => module.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: ADMIN_LAWYER_TRAINING_VERSION,
    implementationScopeSlug: input.implementationScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    modules,
    completionRate,
    adminLawyerTrainingReady: definedRequired === required.length,
  };
}
