/**
 * Phase 15-B — Client submission status SSOT (DB enum ↔ portal display).
 */
import type { ClientSubmissionStatus } from "@prisma/client";

export const PHASE15B_CLIENT_SUBMISSION_STATUS_MARKER =
  "PHASE15B_CLIENT_SUBMISSION_STATUS" as const;

/** Spec-facing status keys (display / docs) */
export const CLIENT_SUBMISSION_DISPLAY_STATUSES = [
  "CLIENT_DRAFT",
  "CLIENT_SUBMITTED",
  "LAWYER_RECEIVED",
  "UNDER_REVIEW",
  "ACCEPTED_AS_CASE_RECORD",
  "NEEDS_MORE_INFO",
  "REJECTED",
] as const;

export type ClientSubmissionDisplayStatus =
  (typeof CLIENT_SUBMISSION_DISPLAY_STATUSES)[number];

const DB_TO_DISPLAY: Record<ClientSubmissionStatus, ClientSubmissionDisplayStatus> = {
  DRAFT: "CLIENT_DRAFT",
  SUBMITTED: "CLIENT_SUBMITTED",
  RECEIVED: "LAWYER_RECEIVED",
  UNDER_REVIEW: "UNDER_REVIEW",
  ACCEPTED: "ACCEPTED_AS_CASE_RECORD",
  NEEDS_MORE_INFO: "NEEDS_MORE_INFO",
  REJECTED: "REJECTED",
};

const DISPLAY_LABELS: Record<ClientSubmissionDisplayStatus, string> = {
  CLIENT_DRAFT: "작성 중",
  CLIENT_SUBMITTED: "제출 완료",
  LAWYER_RECEIVED: "변호사 수신",
  UNDER_REVIEW: "검토 중",
  ACCEPTED_AS_CASE_RECORD: "사건자료 채택",
  NEEDS_MORE_INFO: "추가 요청",
  REJECTED: "반려",
};

export const CLIENT_SUBMISSION_LAWYER_PENDING_STATUSES: ClientSubmissionStatus[] = [
  "SUBMITTED",
  "RECEIVED",
  "UNDER_REVIEW",
];

export function mapClientSubmissionStatusForDisplay(
  status: ClientSubmissionStatus,
): { key: ClientSubmissionDisplayStatus; label: string } {
  const key = DB_TO_DISPLAY[status];
  return { key, label: DISPLAY_LABELS[key] };
}

export function canClientEditSubmission(status: ClientSubmissionStatus): boolean {
  return status === "DRAFT" || status === "NEEDS_MORE_INFO";
}

export function canLawyerReviewSubmission(status: ClientSubmissionStatus): boolean {
  return CLIENT_SUBMISSION_LAWYER_PENDING_STATUSES.includes(status);
}
