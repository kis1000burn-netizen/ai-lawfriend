import type { UiFourPanelRole } from "@/lib/role-map";

/** `getAllowedCaseActions` 입력 역할 — Prisma `USER`는 페이지에서 `prismaRoleToUiRole` 후 전달 */
export type GuardRole = UiFourPanelRole;

type GuardInput = {
  role: GuardRole;
  caseStatus: string;
  facts: {
    interviewCompleted: boolean;
    hasDraftDocument: boolean;
    hasApprovedDocument: boolean;
    hasLockedDocument?: boolean;
  };
};

/** `PUT_ON_HOLD` 출발 상태 — `CASE_TRANSITIONS`(evaluateCaseTransition)와 동일. [353-P1-RB05] */
const PUT_ON_HOLD_FROM = [
  "CREATED",
  "INTAKE_PENDING",
  "IN_INTERVIEW",
  "INTERVIEW_DONE",
  "DRAFTING",
  "REVIEW_PENDING",
  "APPROVED",
  "DELIVERED",
] as const;

/**
 * 사건 상세 **진행 액션** 패널 노출 — `PATCH /api/cases/:id/status`·`checkCaseTransitionOrThrow` **사실조건**과 맞출 것.
 *
 * **353+ 이중 축:** `getAllowedLifecycleActionsForCase` / 응답 `allowedLifecycleActions`는 **상태·역할**만으로 **구조적 후보**를 내며
 * `CASE_TRANSITIONS.requires`는 반영하지 않는다. 본 함수는 **UI에서 실행 가능한지**에 맞춘다.
 * - **`APPROVE_DOCUMENT`**: 패널 없음 — `DocumentReviewPanel`·`/api/legal-documents/:id/approve` 축.
 * - **`DELIVER_DOCUMENT`**: `case-detail-client`에서 잠금 문서 등 **추가 조건**.
 * - **`RESUME_CASE`**: UI 키 `RESUME_FROM_HOLD`로 동일 액션을 `PATCH`에 전달.
 * `DELETED`는 전 항목 false(서버 lifecycle와 같이 **전이 없음**).
 */
export function getAllowedCaseActions(input: GuardInput) {
  if (input.caseStatus === "DELETED") {
    return {
      START_INTERVIEW: false,
      RESUME_FROM_HOLD: false,
      COMPLETE_INTERVIEW: false,
      GENERATE_DRAFT: false,
      REQUEST_REVIEW: false,
      DELIVER_DOCUMENT: false,
      CLOSE_CASE: false,
      PUT_ON_HOLD: false,
      REJECT_CASE: false,
      REOPEN_CASE: false,
    };
  }

  const canManage = ["ADMIN", "LAWYER", "STAFF"].includes(input.role);
  const canApprove = ["ADMIN", "LAWYER"].includes(input.role);
  const { caseStatus, facts } = input;

  return {
    START_INTERVIEW:
      canManage && (caseStatus === "CREATED" || caseStatus === "INTAKE_PENDING"),

    /** HOLD → IN_INTERVIEW (RESUME_CASE) */
    RESUME_FROM_HOLD: canManage && caseStatus === "HOLD",

    /** 인터뷰가 아직 완료 처리되지 않은 경우에만 노출 (완료 후에는 POST /interview/complete로 종료) */
    COMPLETE_INTERVIEW:
      canManage && caseStatus === "IN_INTERVIEW" && !facts.interviewCompleted,

    GENERATE_DRAFT:
      canManage && caseStatus === "INTERVIEW_DONE" && facts.interviewCompleted,

    REQUEST_REVIEW:
      canManage && caseStatus === "DRAFTING" && facts.hasDraftDocument,

    DELIVER_DOCUMENT:
      canManage && caseStatus === "APPROVED" && facts.hasApprovedDocument,

    CLOSE_CASE: canApprove && caseStatus === "DELIVERED",

    PUT_ON_HOLD:
      canManage && (PUT_ON_HOLD_FROM as readonly string[]).includes(caseStatus),

    REJECT_CASE:
      canApprove &&
      [
        "CREATED",
        "INTAKE_PENDING",
        "IN_INTERVIEW",
        "INTERVIEW_DONE",
        "DRAFTING",
        "REVIEW_PENDING",
      ].includes(caseStatus),

    REOPEN_CASE: canApprove && ["REJECTED", "CLOSED"].includes(caseStatus),
  };
}

export type AllowedCaseActions = ReturnType<typeof getAllowedCaseActions>;
