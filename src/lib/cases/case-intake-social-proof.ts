export type CaseIntakeSocialProof = {
  eyebrow: string;
  title: string;
  description: string;
  activityLabel: string;
  activityTone: "active" | "starter";
  bullets: string[];
};

type CaseIntakeSocialProofInput = {
  recentIntakeCount: number;
  activeCaseCount: number;
};

export function buildCaseIntakeSocialProof(
  input: CaseIntakeSocialProofInput,
): CaseIntakeSocialProof {
  const hasRecentActivity = input.recentIntakeCount > 0 || input.activeCaseCount > 0;

  return {
    eyebrow: "익명 접수 흐름",
    title: hasRecentActivity
      ? "최근에도 비슷한 고민을 정리하는 분들이 있습니다."
      : "처음 접수하는 분도 부담 없이 시작할 수 있습니다.",
    description:
      "개별 사건명, 상대방, 파일명, 작성 내용은 공개하지 않습니다. 접수 전에는 전체 흐름만 익명 신호로 보여드립니다.",
    activityLabel: hasRecentActivity ? "최근 접수 활동 있음" : "새 접수 준비 가능",
    activityTone: hasRecentActivity ? "active" : "starter",
    bullets: [
      "다른 사용자에게는 사건의 존재 여부를 특정할 수 없게 표시합니다.",
      "접수 후 상세 내용은 본인과 권한 있는 담당자만 확인합니다.",
      "지금 입력한 내용은 사건 접수와 검토 준비를 위한 내부 기록으로 남습니다.",
    ],
  };
}
