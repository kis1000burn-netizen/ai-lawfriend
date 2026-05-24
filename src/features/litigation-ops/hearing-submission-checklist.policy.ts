/**
 * Product Phase 24-D — Hearing / submission checklist policy SSOT.
 */
import { getChecklistTemplate } from "./hearing-submission-checklist.registry";
import type {
  HearingSubmissionChecklist,
  HearingSubmissionChecklistType,
} from "./hearing-submission-checklist.schema";
import { HEARING_SUBMISSION_CHECKLIST_VERSION } from "./hearing-submission-checklist.schema";

export const HEARING_SUBMISSION_CHECKLIST_POLICY_MARKER_PHASE24D =
  "phase24d-hearing-submission-checklist-policy" as const;

export const HEARING_SUBMISSION_CHECKLIST_DISCLAIMER =
  "Hearing/Submission Checklist는 변호사 검토용 준비 목록입니다. 법원·사건별 추가 요건은 담당 변호사가 확인해야 합니다." as const;

export function evaluateChecklistItemCompletion(input: {
  category: "DOCUMENT" | "EVIDENCE" | "DEADLINE" | "TASK" | "CLIENT";
  hasApprovedDocuments: boolean;
  hasAttachments: boolean;
  hasOpenDeadlines: boolean;
  hasOpenTasks: boolean;
  hasClientVisibleDeadline: boolean;
}): boolean {
  switch (input.category) {
    case "DOCUMENT":
      return input.hasApprovedDocuments;
    case "EVIDENCE":
      return input.hasAttachments;
    case "DEADLINE":
      return !input.hasOpenDeadlines || input.hasClientVisibleDeadline;
    case "TASK":
      return !input.hasOpenTasks;
    case "CLIENT":
      return input.hasClientVisibleDeadline;
    default:
      return false;
  }
}

export function assembleHearingSubmissionChecklist(input: {
  caseId: string;
  checklistType: HearingSubmissionChecklistType;
  hasApprovedDocuments: boolean;
  hasAttachments: boolean;
  hasOpenDeadlines: boolean;
  hasOpenTasks: boolean;
  hasClientVisibleDeadline: boolean;
  generatedAt?: string;
}): HearingSubmissionChecklist {
  const template = getChecklistTemplate(input.checklistType);
  const items = template.map((item) => ({
    ...item,
    completed: evaluateChecklistItemCompletion({
      category: item.category,
      hasApprovedDocuments: input.hasApprovedDocuments,
      hasAttachments: input.hasAttachments,
      hasOpenDeadlines: input.hasOpenDeadlines,
      hasOpenTasks: input.hasOpenTasks,
      hasClientVisibleDeadline: input.hasClientVisibleDeadline,
    }),
  }));

  const requiredItems = items.filter((item) => item.required);
  const completedRequired = requiredItems.filter((item) => item.completed).length;
  const completionRate =
    requiredItems.length === 0
      ? 100
      : Math.round((completedRequired / requiredItems.length) * 100);

  return {
    packVersion: HEARING_SUBMISSION_CHECKLIST_VERSION,
    caseId: input.caseId,
    checklistType: input.checklistType,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    allRequiredComplete: completedRequired === requiredItems.length,
    disclaimer: HEARING_SUBMISSION_CHECKLIST_DISCLAIMER,
  };
}
