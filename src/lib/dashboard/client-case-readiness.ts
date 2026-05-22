import type { CaseStatus } from "@prisma/client";
import { maxInterviewAnswerCount } from "@/features/case-interview/interview-answers-for-ui";
import {
  EMPTY_CLIENT_CASE_READINESS,
  type ClientCaseReadiness,
  type ClientCaseReadinessItem,
} from "@/lib/dashboard/dashboard-metrics";

export type ReadinessCaseInput = {
  id: string;
  title?: string | null;
  caseType?: string | null;
  status?: string | null;
  description?: string | null;
  summary?: string | null;
  interviewAnswerCount?: number;
  attachmentCount?: number;
  opponentName?: string | null;
  opponentInfo?: string | null;
};

/** CaseStatus canonical — `schema.prisma`·`case-status.ts`와 동일. */
const REVIEW_READY_STATUSES = new Set<CaseStatus>([
  "IN_INTERVIEW",
  "INTERVIEW_DONE",
  "DRAFTING",
  "REVIEW_PENDING",
  "APPROVED",
  "DELIVERED",
  "CLOSED",
]);

export function countInterviewAnswerEntries(
  interviews: { answersJson: unknown }[],
  interviewAnswersMemoContent?: string | null,
): number {
  return maxInterviewAnswerCount(interviews, interviewAnswersMemoContent);
}

export function buildClientCaseReadiness(
  sourceCase?: ReadinessCaseInput | null,
): ClientCaseReadiness {
  if (!sourceCase) {
    return EMPTY_CLIENT_CASE_READINESS;
  }

  const hasBasic = Boolean(
    sourceCase.title?.trim() ||
      sourceCase.caseType?.trim() ||
      sourceCase.status,
  );
  const hasStory = Boolean(
    sourceCase.description?.trim() ||
      sourceCase.summary?.trim() ||
      (sourceCase.interviewAnswerCount ?? 0) > 0,
  );
  const hasOpponent = Boolean(
    sourceCase.opponentName?.trim() || sourceCase.opponentInfo?.trim(),
  );
  const hasAttachments = (sourceCase.attachmentCount ?? 0) > 0;
  const hasReviewReady = sourceCase.status
    ? REVIEW_READY_STATUSES.has(sourceCase.status as CaseStatus)
    : false;

  const items: ClientCaseReadinessItem[] = [
    {
      key: "basic",
      label: "기본 정보",
      done: hasBasic,
      description: hasBasic
        ? "사건의 기본 정보가 준비되었습니다."
        : "사건 제목과 기본 정보를 입력하면 완료됩니다.",
    },
    {
      key: "story",
      label: "사건 경위",
      done: hasStory,
      description: hasStory
        ? "사건의 흐름을 확인할 수 있습니다."
        : "인터뷰 답변이나 사건 설명이 필요합니다.",
    },
    {
      key: "opponent",
      label: "상대방 정보",
      done: hasOpponent,
      description: hasOpponent
        ? "상대방 또는 관련 당사자 정보가 준비되었습니다."
        : "상대방 정보가 있으면 사건 정리에 도움이 됩니다.",
    },
    {
      key: "attachments",
      label: "첨부자료",
      done: hasAttachments,
      description: hasAttachments
        ? "사건 관련 첨부자료가 연결되었습니다."
        : "계약서, 문자, 사진 등 관련 자료를 연결해 주세요.",
    },
    {
      key: "review",
      label: "검토 준비",
      done: hasReviewReady,
      description: hasReviewReady
        ? "검토를 위한 기본 흐름이 준비되었습니다."
        : "인터뷰를 진행하면 검토 준비도가 올라갑니다.",
    },
  ];

  const doneCount = items.filter((item) => item.done).length;
  const totalCount = items.length;
  const percent = Math.round((doneCount / totalCount) * 100);

  return {
    percent,
    doneCount,
    totalCount,
    items,
    sourceCaseId: sourceCase.id,
    sourceCaseTitle: sourceCase.title ?? undefined,
  };
}
