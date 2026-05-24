import { statusLabel } from "@/features/cases/case.utils";

export function formatDashboardDateTime(
  value?: Date | string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function getDashboardCaseStatusLabel(
  status?: string | null,
): string | undefined {
  if (!status) {
    return undefined;
  }

  return statusLabel(status);
}

export function getDashboardCaseTitle(title?: string | null): string {
  const trimmed = title?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : "제목 없는 사건";
}

export function getDashboardCaseHref(caseId: string): string {
  return `/cases/${caseId}`;
}

export function getDashboardReviewCtaLabel(): string {
  return "사건 보기";
}

export function getDashboardAdminAttentionCtaLabel(): string {
  return "사건 확인";
}

export function getDashboardAdminAttentionReason(
  status?: string | null,
): string {
  if (status === "HOLD") {
    return "보류 상태 확인";
  }

  if (status === "INTAKE_PENDING") {
    return "접수·보완 확인";
  }

  if (status === "REVIEW_PENDING") {
    return "검토 대기 확인";
  }

  return "운영 확인";
}
