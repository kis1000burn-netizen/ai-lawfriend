/**
 * Product Phase 36-C — Admin / lawyer training schedule service.
 */
import { IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG } from "../project-plan/implementation-project-plan.registry";
import { ADMIN_LAWYER_TRAINING_MODULES } from "./admin-lawyer-training-schedule.registry";
import { assembleAdminLawyerTrainingSchedule } from "./admin-lawyer-training-schedule.policy";
import type { AdminLawyerTrainingScheduleResult } from "./admin-lawyer-training-schedule.schema";

export const ADMIN_LAWYER_TRAINING_SERVICE_MARKER_PHASE36C =
  "phase36c-admin-lawyer-training-service" as const;

export function buildAdminLawyerTrainingSchedule(input?: {
  implementationScopeSlug?: string;
  definedModuleIds?: string[];
}): AdminLawyerTrainingScheduleResult {
  const definedModuleIds = new Set(
    input?.definedModuleIds ??
      ADMIN_LAWYER_TRAINING_MODULES.filter((module) => module.required).map(
        (module) => module.moduleId,
      ),
  );

  return assembleAdminLawyerTrainingSchedule({
    implementationScopeSlug:
      input?.implementationScopeSlug ?? IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG,
    definedModuleIds,
  });
}
