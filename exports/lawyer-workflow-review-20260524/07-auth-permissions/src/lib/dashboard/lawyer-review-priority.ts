export type LawyerReviewPriority = {
  score: number;
  label: string;
  tone: "cyan" | "amber" | "slate";
};

/** 업무상 검토 순서 안내(법률 위험도·승패 평가 아님). */
export function getLawyerReviewPriority(
  status?: string | null,
): LawyerReviewPriority {
  switch (status) {
    case "REVIEW_PENDING":
      return {
        score: 90,
        label: "우선 검토",
        tone: "cyan",
      };

    case "DRAFTING":
      return {
        score: 75,
        label: "초안 확인",
        tone: "amber",
      };

    case "INTERVIEW_DONE":
      return {
        score: 60,
        label: "인터뷰 검토",
        tone: "slate",
      };

    case "INTAKE_PENDING":
    case "HOLD":
      return {
        score: 45,
        label: "보완 확인",
        tone: "amber",
      };

    default:
      return {
        score: 30,
        label: "일반 확인",
        tone: "slate",
      };
  }
}
