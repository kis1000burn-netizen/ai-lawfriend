/**
 * Phase 14-A — narrative summary builder for Litigation Command Center.
 */
import { CASE_STATUS_LABELS, type CaseStatus } from "@/lib/definitions/case-status";
import type { LitigationCommandCenterResponse } from "./litigation-command-center.schema";

type Deadline = LitigationCommandCenterResponse["deadlines"][number];
type OpponentBrief = LitigationCommandCenterResponse["opponentBriefs"][number];
type Narrative = LitigationCommandCenterResponse["narrative"];

type NarrativeInput = {
  caseStatus: CaseStatus;
  opponentBriefs: OpponentBrief[];
  hasEvidenceMapping: boolean;
  hasOpsSync: boolean;
  hasLitigationFiles: boolean;
  confirmedRebuttalCount: number;
  confirmedEvidenceGapCount: number;
  clientConfirmationCount: number;
  reviewPendingCount: number;
  deadlines: Deadline[];
};

function formatDateKo(iso: string): string {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function detectPhaseLabel(input: NarrativeInput): string {
  const analyzedBriefs = input.opponentBriefs.filter(
    (b) => b.analysisStatus === "AI_ANALYZED",
  );

  if (input.hasOpsSync) {
    return "운영 연동·제출 준비 단계";
  }
  if (analyzedBriefs.length > 0) {
    return "상대방 답변서 분석 후 준비서면 대응 단계";
  }
  if (input.hasEvidenceMapping) {
    return "증거 매핑·검토 단계";
  }
  if (input.hasLitigationFiles) {
    return "문서 분류·분석 진행 단계";
  }
  return "자료 업로드·분석 준비 단계";
}

function findNextDeadline(deadlines: Deadline[]): Deadline | null {
  const open = deadlines.filter((d) => d.status === "OPEN");
  const withDue = open
    .filter((d) => d.dueAt)
    .sort(
      (a, b) =>
        new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime(),
    );
  if (withDue.length > 0) {
    return withDue[0] ?? null;
  }
  return open[0] ?? null;
}

export function buildLitigationCommandCenterNarrative(
  input: NarrativeInput,
): Narrative {
  const phaseLabel = detectPhaseLabel(input);
  const nextDeadline = findNextDeadline(input.deadlines);

  const detailParts: string[] = [];
  if (input.confirmedRebuttalCount > 0) {
    detailParts.push(`확정된 반박 쟁점 ${input.confirmedRebuttalCount}건`);
  }
  if (input.confirmedEvidenceGapCount > 0) {
    detailParts.push(`증거 보완 ${input.confirmedEvidenceGapCount}건`);
  }
  if (input.clientConfirmationCount > 0) {
    detailParts.push(`의뢰인 확인 요청 ${input.clientConfirmationCount}건`);
  }
  if (input.reviewPendingCount > 0) {
    detailParts.push(`변호사 검토 대기 ${input.reviewPendingCount}건`);
  }

  const headline =
    detailParts.length > 0
      ? detailParts.join(", ") + "이 있습니다."
      : "현재 확정된 운영 항목이 없습니다. Document Intelligence 검토를 진행하세요.";

  const detailLines = [
    `사건 상태: ${CASE_STATUS_LABELS[input.caseStatus]}`,
    `현재 단계: ${phaseLabel}`,
  ];

  let nextDeadlineText: string | null = null;
  if (nextDeadline) {
    const dueLabel = nextDeadline.dueAt
      ? formatDateKo(nextDeadline.dueAt)
      : nextDeadline.candidateDueText ?? "기한 미확정";
    nextDeadlineText = `다음 마감은 ${dueLabel} ${nextDeadline.title}입니다.`;
    detailLines.push(nextDeadlineText);
  }

  return {
    phaseLabel,
    headline,
    detailLines,
    nextDeadlineText,
  };
}

export function computeDaysUntilDue(dueAt: Date | null | undefined): number | null {
  if (!dueAt) {
    return null;
  }
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(dueAt.getFullYear(), dueAt.getMonth(), dueAt.getDate());
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
