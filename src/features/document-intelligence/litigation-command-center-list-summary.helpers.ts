/**
 * Phase 14-D — list summary helpers (phase label, priority).
 */
import { computeDaysUntilDue } from "./litigation-command-center.summary";

export function buildListSummaryPhaseLabel(input: {
  hasOpsSync: boolean;
  opponentBriefAnalyzedCount: number;
  hasEvidenceMapping: boolean;
  hasLitigationFiles: boolean;
}): string {
  if (input.hasOpsSync) {
    return "운영 연동·제출 준비";
  }
  if (input.opponentBriefAnalyzedCount > 0) {
    return "상대방 서면 대응";
  }
  if (input.hasEvidenceMapping) {
    return "증거 매핑·검토";
  }
  if (input.hasLitigationFiles) {
    return "문서 분석 진행";
  }
  return "분석 준비";
}

export function computeListSummaryPriority(input: {
  todayTaskCount: number;
  reviewPendingCount: number;
  supplementDraftCount: number;
  supplementAwaitingReviewCount?: number;
  daysUntilNextDeadline: number | null;
  isDeadlineImminent: boolean;
}): { score: number; label: string } {
  let score = 0;
  if (input.isDeadlineImminent) {
    score += 100;
  }
  if (input.daysUntilNextDeadline !== null && input.daysUntilNextDeadline >= 0) {
    score += Math.max(0, 14 - input.daysUntilNextDeadline);
  }
  score += input.todayTaskCount * 5;
  score += input.reviewPendingCount * 3;
  score += input.supplementDraftCount * 2;
  score += (input.supplementAwaitingReviewCount ?? 0) * 4;

  if (input.isDeadlineImminent) {
    return { score, label: "기일 임박" };
  }
  if ((input.supplementAwaitingReviewCount ?? 0) > 0) {
    return { score, label: "보완 응답" };
  }
  if (input.reviewPendingCount > 0) {
    return { score, label: "검토 우선" };
  }
  if (input.todayTaskCount > 0) {
    return { score, label: "업무 처리" };
  }
  if (input.supplementDraftCount > 0) {
    return { score, label: "보완 발송" };
  }
  return { score, label: "정상" };
}

export { computeDaysUntilDue };
