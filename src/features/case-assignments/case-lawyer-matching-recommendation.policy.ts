import type {
  CaseLawyerMatchingExclusionReason,
  CaseLawyerMatchingRecommendation,
  CaseLawyerMatchingRecommendationStatus,
} from "./case-lawyer-matching.schema";
import type { CaseLawyerMatchingFixtureKey } from "./case-lawyer-matching.registry";

export const CASE_LAWYER_MATCHING_MAX_ACTIVE_ASSIGNMENTS = 20;

export const CASE_LAWYER_MATCHING_SAFE_SPECIALTY_LABELS: Record<
  CaseLawyerMatchingFixtureKey,
  string[]
> = {
  JOOHWAN_LAND_ACCESS: ["부동산 관련 분쟁"],
  CONSTRUCTION_INJURY_COMPENSATION: ["산업재해 및 손해배상 관련 검토"],
};

export type CaseLawyerMatchingCandidate = {
  lawyerId: string;
  userStatus: "ACTIVE" | "PENDING" | "SUSPENDED" | "DELETED";
  verificationStatus:
    | "NOT_SUBMITTED"
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | null;
  specialtiesNote: string | null;
  activeAssignmentCount: number;
};

type BuildRecommendationInput = {
  recommendationId: string;
  caseId: string;
  fixtureKey: CaseLawyerMatchingFixtureKey | null;
  matchedSpecialties: string[];
  recommendedAssignmentNote: string;
  candidates: CaseLawyerMatchingCandidate[];
  conflictLawyerIds?: string[];
  generatedBy?: "RULE_ENGINE" | "AI_ASSIST";
};

function specialtyKeywords(specialty: string) {
  if (specialty.includes("부동산")) {
    return ["부동산", "토지", "임대", "등기", "통행", "지역권"];
  }
  if (specialty.includes("산업재해") || specialty.includes("손해배상")) {
    return ["산재", "산업재해", "손해배상", "재해", "건설"];
  }
  return specialty
    .split(/[\s·,/]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function hasVerifiedSpecialty(
  candidate: CaseLawyerMatchingCandidate,
  matchedSpecialties: string[],
) {
  const note = candidate.specialtiesNote?.trim().toLowerCase() ?? "";
  if (note.length === 0) {
    return false;
  }

  return matchedSpecialties.some((specialty) =>
    specialtyKeywords(specialty).some((keyword) =>
      note.includes(keyword.toLowerCase()),
    ),
  );
}

function resolveExclusionReason(
  candidate: CaseLawyerMatchingCandidate,
  matchedSpecialties: string[],
  conflictLawyerIds: Set<string>,
): CaseLawyerMatchingExclusionReason | null {
  if (candidate.userStatus !== "ACTIVE") {
    return "INACTIVE";
  }
  if (candidate.verificationStatus !== "APPROVED") {
    return "UNVERIFIED";
  }
  if (conflictLawyerIds.has(candidate.lawyerId)) {
    return "CONFLICT_RISK";
  }
  if (!hasVerifiedSpecialty(candidate, matchedSpecialties)) {
    return "SPECIALTY_MISMATCH";
  }
  if (candidate.activeAssignmentCount >= CASE_LAWYER_MATCHING_MAX_ACTIVE_ASSIGNMENTS) {
    return "CAPACITY_LIMIT";
  }
  return null;
}

function resolveRecommendationStatus(input: {
  matchedSpecialties: string[];
  excludedLawyers: CaseLawyerMatchingRecommendation["excludedLawyers"];
  eligibleLawyerIds: string[];
}): CaseLawyerMatchingRecommendationStatus {
  if (input.matchedSpecialties.length === 0) {
    return "DRAFT";
  }

  const hasConflict = input.excludedLawyers.some(
    (item) => item.reason === "CONFLICT_RISK",
  );

  if (hasConflict) {
    return "REVIEW_REQUIRED";
  }

  if (input.eligibleLawyerIds.length === 0) {
    return "REVIEW_REQUIRED";
  }

  return "ASSIGNMENT_READY";
}

export function buildCaseLawyerMatchingRecommendation(
  input: BuildRecommendationInput,
): CaseLawyerMatchingRecommendation {
  const conflictLawyerIds = new Set(input.conflictLawyerIds ?? []);
  const excludedLawyers: CaseLawyerMatchingRecommendation["excludedLawyers"] = [];
  const eligibleLawyerIds: string[] = [];

  for (const candidate of input.candidates) {
    const reason = resolveExclusionReason(
      candidate,
      input.matchedSpecialties,
      conflictLawyerIds,
    );
    if (reason) {
      excludedLawyers.push({ lawyerId: candidate.lawyerId, reason });
      continue;
    }
    eligibleLawyerIds.push(candidate.lawyerId);
  }

  const status = resolveRecommendationStatus({
    matchedSpecialties: input.matchedSpecialties,
    excludedLawyers,
    eligibleLawyerIds,
  });

  return {
    recommendationId: input.recommendationId,
    caseId: input.caseId,
    status,
    matchedSpecialties: [...input.matchedSpecialties],
    excludedLawyers,
    recommendedAssignmentNote: input.recommendedAssignmentNote,
    generatedBy: input.generatedBy ?? "RULE_ENGINE",
    requiresHumanApproval: true,
    eligibleLawyerIds,
    version: 1,
  };
}
