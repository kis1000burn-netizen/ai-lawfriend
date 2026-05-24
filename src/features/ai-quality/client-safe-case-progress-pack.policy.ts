/**
 * Product Phase 23-E — Client-safe case progress pack policy SSOT.
 */
import { CLIENT_SAFE_BLOCKED_CATEGORIES } from "@/features/ai-core/client-safe-disclosure.schema";
import type { ClientSafeCaseProgressPack } from "./client-safe-case-progress-pack.schema";
import { CLIENT_SAFE_CASE_PROGRESS_PACK_VERSION } from "./client-safe-case-progress-pack.schema";

export const CLIENT_SAFE_CASE_PROGRESS_PACK_POLICY_MARKER_PHASE23E =
  "phase23e-client-safe-case-progress-pack-policy" as const;

export const CLIENT_SAFE_CASE_PROGRESS_PACK_DISCLAIMER =
  "본 진행 안내는 의뢰인에게 공개 가능한 범위만 포함합니다. 내부 법률 분석·변호사 메모·미검토 AI 출력은 포함되지 않습니다." as const;

export function buildClientSafeProgressMilestones(caseStatus: string) {
  const interviewStatus: ClientSafeCaseProgressPack["milestones"][number]["status"] =
    caseStatus === "CREATED" || caseStatus === "INTAKE_PENDING"
      ? "UPCOMING"
      : caseStatus === "IN_INTERVIEW"
        ? "IN_PROGRESS"
        : "DONE";

  const documentStatus: ClientSafeCaseProgressPack["milestones"][number]["status"] =
    caseStatus === "DRAFTING" || caseStatus === "REVIEW_PENDING"
      ? "IN_PROGRESS"
      : caseStatus === "APPROVED" ||
          caseStatus === "DELIVERED" ||
          caseStatus === "CLOSED"
        ? "DONE"
        : interviewStatus === "DONE"
          ? "UPCOMING"
          : "UPCOMING";

  const deliveryStatus: ClientSafeCaseProgressPack["milestones"][number]["status"] =
    caseStatus === "DELIVERED" || caseStatus === "CLOSED" ? "DONE" : "UPCOMING";

  const milestones: ClientSafeCaseProgressPack["milestones"] = [
    {
      milestoneId: "m1",
      label: "사건 등록",
      status: "DONE",
      clientVisible: true,
    },
    {
      milestoneId: "m2",
      label: "인터뷰 진행",
      status: interviewStatus,
      clientVisible: true,
    },
    {
      milestoneId: "m3",
      label: "문서 작성·검토",
      status: documentStatus,
      clientVisible: true,
    },
    {
      milestoneId: "m4",
      label: "의뢰인 전달",
      status: deliveryStatus,
      clientVisible: true,
    },
  ];

  return milestones;
}

export function buildClientSafeProgressSummary(input: {
  caseStatus: string;
  hasReleasedStatements: boolean;
}): { progressSummary: string; releaseGatePassed: boolean; emptyReleaseNotice?: string } {
  if (!input.hasReleasedStatements && input.caseStatus === "CREATED") {
    return {
      progressSummary: "사건이 등록되었습니다. 인터뷰를 진행하면 진행 상황이 업데이트됩니다.",
      releaseGatePassed: false,
      emptyReleaseNotice: "아직 의뢰인에게 공개 가능한 AI 정리 문장이 없습니다.",
    };
  }

  return {
    progressSummary: `현재 사건 상태는 ${input.caseStatus}입니다. 공개 가능한 범위의 진행 정보만 포함됩니다.`,
    releaseGatePassed: input.hasReleasedStatements,
  };
}

export function assembleClientSafeCaseProgressPack(input: {
  caseId: string;
  caseStatus: string;
  hasReleasedStatements: boolean;
  generatedAt?: string;
}): ClientSafeCaseProgressPack {
  const { progressSummary, releaseGatePassed, emptyReleaseNotice } =
    buildClientSafeProgressSummary(input);

  return {
    packVersion: CLIENT_SAFE_CASE_PROGRESS_PACK_VERSION,
    caseId: input.caseId,
    caseStatus: input.caseStatus as ClientSafeCaseProgressPack["caseStatus"],
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    releaseGatePassed,
    milestones: buildClientSafeProgressMilestones(input.caseStatus),
    progressSummary,
    blockedCategories: [...CLIENT_SAFE_BLOCKED_CATEGORIES],
    disclaimer: CLIENT_SAFE_CASE_PROGRESS_PACK_DISCLAIMER,
    emptyReleaseNotice,
  };
}
