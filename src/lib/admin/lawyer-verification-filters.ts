import { LawyerVerificationStatus } from "@prisma/client";

const DEFAULT_QUEUE: LawyerVerificationStatus[] = [
  LawyerVerificationStatus.PENDING,
  LawyerVerificationStatus.NEEDS_MORE_INFO,
];

/** 목록·API 공통: 미지정 시 승인 큐(PENDING·NEEDS_MORE_INFO), `status=PENDING` 등 단일값, `status=QUEUE` 명시 */
export function resolveLawyerVerificationListStatuses(
  raw: string | undefined | null,
): LawyerVerificationStatus[] {
  if (!raw?.trim()) return DEFAULT_QUEUE;
  const u = raw.trim().toUpperCase();
  if (u === "QUEUE") return DEFAULT_QUEUE;
  const one = u as LawyerVerificationStatus;
  if (Object.values(LawyerVerificationStatus).includes(one)) {
    return [one];
  }
  return DEFAULT_QUEUE;
}

export { DEFAULT_QUEUE as LAWYER_VERIFICATION_DEFAULT_QUEUE };
