/**
 * Product Phase 36-C — Admin / lawyer training schedule SSOT.
 */
import type { AdminLawyerTrainingScheduleResult } from "./admin-lawyer-training-schedule.schema";

export const ADMIN_LAWYER_TRAINING_REGISTRY_MARKER_PHASE36C =
  "phase36c-admin-lawyer-training-registry" as const;

type AdminLawyerTrainingModule = Omit<
  AdminLawyerTrainingScheduleResult["modules"][number],
  "defined"
>;

export const ADMIN_LAWYER_TRAINING_MODULES: AdminLawyerTrainingModule[] = [
  { moduleId: "ADMIN_ONBOARDING", label: "Admin onboarding session", required: true },
  { moduleId: "LAWYER_WORKFLOW_TRAINING", label: "Lawyer workflow training", required: true },
  { moduleId: "CASE_INTAKE_TRAINING", label: "Case intake and interview training", required: true },
  {
    moduleId: "DOCUMENT_WORKFLOW_TRAINING",
    label: "Document generation and review training",
    required: true,
  },
  {
    moduleId: "SUPPORT_ESCALATION_TRAINING",
    label: "Support and escalation training",
    required: true,
  },
];
