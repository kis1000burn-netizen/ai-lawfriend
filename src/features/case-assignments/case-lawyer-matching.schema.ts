import type { CaseLawyerMatchingFixtureKey } from "./case-lawyer-matching.registry";

export type CaseLawyerMatchingStepStatus = "READY" | "PENDING" | "BLOCKED";

export type CaseLawyerMatchingStep = {
  stepId: string;
  label: string;
  status: CaseLawyerMatchingStepStatus;
  summary: string;
};

export type CaseLawyerMatchingProfile = {
  fixtureKey: CaseLawyerMatchingFixtureKey | null;
  caseId: string;
  category: string | null;
  mappedCaseType: string | null;
  gongbuhoCode: string | null;
  practiceAreaLabels: string[];
  matchingRationale: string;
};

export type CaseLawyerMatchingWorkflowResult = {
  marker: string;
  profile: CaseLawyerMatchingProfile;
  steps: CaseLawyerMatchingStep[];
  recommendedAssignmentNote: string | null;
  /** @deprecated recommendation.status 사용 — 자동 배정 여부가 아님 */
  assignmentReady: boolean;
  recommendation?: CaseLawyerMatchingRecommendation;
};

export type CaseLawyerMatchingRecommendationStatus =
  | "DRAFT"
  | "REVIEW_REQUIRED"
  | "ASSIGNMENT_READY"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type CaseLawyerMatchingExclusionReason =
  | "INACTIVE"
  | "UNVERIFIED"
  | "CONFLICT_RISK"
  | "SPECIALTY_MISMATCH"
  | "CAPACITY_LIMIT";

export type CaseLawyerMatchingRecommendation = {
  recommendationId: string;
  caseId: string;
  status: CaseLawyerMatchingRecommendationStatus;
  matchedSpecialties: string[];
  excludedLawyers: Array<{
    lawyerId: string;
    reason: CaseLawyerMatchingExclusionReason;
  }>;
  recommendedAssignmentNote: string;
  generatedBy: "RULE_ENGINE" | "AI_ASSIST";
  requiresHumanApproval: true;
  eligibleLawyerIds: string[];
  version: number;
};

export type StoredCaseLawyerMatchingRecommendation = CaseLawyerMatchingRecommendation & {
  createdByAdminId: string;
  approvedAssignmentId?: string | null;
  approvedByAdminId?: string | null;
  approvedAt?: string | null;
  rejectedByAdminId?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const APPROVABLE_CASE_LAWYER_MATCHING_RECOMMENDATION_STATUSES = [
  "REVIEW_REQUIRED",
  "ASSIGNMENT_READY",
] as const satisfies readonly CaseLawyerMatchingRecommendationStatus[];

export const TERMINAL_CASE_LAWYER_MATCHING_RECOMMENDATION_STATUSES = [
  "APPROVED",
  "REJECTED",
  "EXPIRED",
] as const satisfies readonly CaseLawyerMatchingRecommendationStatus[];
