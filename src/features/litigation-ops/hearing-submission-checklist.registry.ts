/**
 * Product Phase 24-D — Hearing / submission checklist templates SSOT.
 */
import type { HearingSubmissionChecklistType } from "./hearing-submission-checklist.schema";

export const HEARING_SUBMISSION_CHECKLIST_REGISTRY_MARKER_PHASE24D =
  "phase24d-hearing-submission-checklist-registry" as const;

type ChecklistTemplateItem = {
  itemId: string;
  label: string;
  required: boolean;
  category: "DOCUMENT" | "EVIDENCE" | "DEADLINE" | "TASK" | "CLIENT";
};

export const HEARING_CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = [
  { itemId: "h1", label: "기일 확인·캘린더 등록", required: true, category: "DEADLINE" },
  { itemId: "h2", label: "출석 준비서면·자료 검토", required: true, category: "DOCUMENT" },
  { itemId: "h3", label: "증거·부속서류 준비", required: true, category: "EVIDENCE" },
  { itemId: "h4", label: "미완료 Task 처리", required: false, category: "TASK" },
  { itemId: "h5", label: "의뢰인 출석 안내(필요 시)", required: false, category: "CLIENT" },
];

export const SUBMISSION_CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = [
  { itemId: "s1", label: "제출기한 확인", required: true, category: "DEADLINE" },
  { itemId: "s2", label: "제출 서면 최종 승인", required: true, category: "DOCUMENT" },
  { itemId: "s3", label: "증거목록·부속서류 첨부", required: true, category: "EVIDENCE" },
  { itemId: "s4", label: "법원 제출 형식·부수 확인", required: true, category: "DOCUMENT" },
  { itemId: "s5", label: "제출 후 접수 확인", required: true, category: "TASK" },
];

export function getChecklistTemplate(type: HearingSubmissionChecklistType) {
  return type === "HEARING" ? HEARING_CHECKLIST_TEMPLATE : SUBMISSION_CHECKLIST_TEMPLATE;
}
