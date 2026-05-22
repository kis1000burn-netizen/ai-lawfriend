import { parseStoredAnswers } from "@/features/case-interview/case-interview.service";
import type { InterviewAnswerMap, InterviewAnswerValue } from "@/features/question-set/question-set.types";

/** 인터뷰 진행 중 메모(CLIENT_INTERVIEW_ANSWERS)·완료 후 `answersJson` 집계에 공통 사용 */
export function isFilledInterviewAnswerValue(value: InterviewAnswerValue): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean" || typeof value === "number") return true;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

export function countFilledKeysInInterviewAnswerMap(map: InterviewAnswerMap): number {
  return Object.values(map).filter((v) => isFilledInterviewAnswerValue(v)).length;
}

/** `Interview` 행만 순회할 때(JSON 기준 답변 수). */
export function countInterviewAnswersFromJsonRows(interviews: { answersJson: unknown }[]): number {
  let n = 0;
  for (const { answersJson } of interviews) {
    if (answersJson == null) continue;
    if (Array.isArray(answersJson)) {
      n += answersJson.filter((x) => x != null && x !== "").length;
    } else if (typeof answersJson === "object") {
      n += Object.keys(answersJson as object).length;
    }
  }
  return n;
}

/**
 * 대시보드 준비도 등: 진행 중 답변(메모)과 완료 후 `Interview.answersJson` 중 더 넓게 반영되는 쪽 사용.
 */
export function maxInterviewAnswerCount(
  interviews: { answersJson: unknown }[],
  memoContent: string | null | undefined,
): number {
  const memo = parseStoredAnswers(memoContent ?? undefined);
  return Math.max(
    countFilledKeysInInterviewAnswerMap(memo),
    countInterviewAnswersFromJsonRows(interviews),
  );
}

/** 진단 카드·요약 불릿: 메모 우선 덮어쓰기 + JSON 나머지 키 */
export function mergedInterviewAnswersRecordForPreview(
  memoContent: string | null | undefined,
  answersJson: unknown | null | undefined,
): Record<string, unknown> | null {
  const memo = parseStoredAnswers(memoContent ?? undefined);

  let fromJson: Record<string, unknown> = {};
  if (answersJson && typeof answersJson === "object" && !Array.isArray(answersJson)) {
    fromJson = { ...(answersJson as Record<string, unknown>) };
  }

  const fromMemoFiltered: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(memo)) {
    if (!isFilledInterviewAnswerValue(v)) continue;
    fromMemoFiltered[k] = v;
  }

  const merged = { ...fromJson, ...fromMemoFiltered };
  return Object.keys(merged).length > 0 ? merged : null;
}
