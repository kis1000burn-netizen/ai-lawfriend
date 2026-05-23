/**
 * Phase 6-F — CMB Publish/Lock 상태 전이 게이트
 */
import type { AibeopchinCmbCaseConfig, AibeopchinCmbStatus } from "@/cmb/core/cmb-schema";
import { assertCmbGatePolicyImmutable } from "@/cmb/policies/gate-policy";

export const CMB_PUBLISH_TRANSITIONS: Record<
  AibeopchinCmbStatus,
  readonly AibeopchinCmbStatus[]
> = {
  DRAFT: ["REVIEW"],
  REVIEW: ["DRAFT", "VERIFY_PASS"],
  VERIFY_PASS: ["REVIEW", "LOCKED"],
  LOCKED: ["PUBLISHED"],
  PUBLISHED: [],
};

export function getAllowedCmbPublishTransitions(
  from: AibeopchinCmbStatus,
): readonly AibeopchinCmbStatus[] {
  return CMB_PUBLISH_TRANSITIONS[from] ?? [];
}

export function assertCmbPublishTransitionAllowed(
  from: AibeopchinCmbStatus,
  to: AibeopchinCmbStatus,
): string | null {
  if (from === to) {
    return "동일 상태로 전이할 수 없습니다.";
  }
  const allowed = getAllowedCmbPublishTransitions(from);
  if (!allowed.includes(to)) {
    return `${from} → ${to} 전이는 허용되지 않습니다.`;
  }
  return null;
}

/** LOCKED/PUBLISHED revision 의 configJson 은 수정 불가 */
export function assertCmbRevisionContentEditable(status: AibeopchinCmbStatus): string | null {
  if (status === "LOCKED" || status === "PUBLISHED") {
    return `${status} revision은 config 수정이 금지됩니다 (preview/transition만 허용).`;
  }
  return null;
}

/** gate 약화 시도 차단 — immutable gate 가 baseline 대비 약해지면 거부 */
export function assertNoCmbGateWeakening(
  baseline: AibeopchinCmbCaseConfig,
  candidate: AibeopchinCmbCaseConfig,
): string[] {
  const errors: string[] = [];

  if (baseline.gongbuho.requireApprovedPacketsOnly && !candidate.gongbuho.requireApprovedPacketsOnly) {
    errors.push("gongbuho.requireApprovedPacketsOnly 를 false 로 약화할 수 없습니다.");
  }

  if (
    baseline.gates.requireLawyerReviewBeforeFinalize &&
    !candidate.gates.requireLawyerReviewBeforeFinalize
  ) {
    errors.push("gates.requireLawyerReviewBeforeFinalize 를 false 로 약화할 수 없습니다.");
  }

  if (
    baseline.interview.voiceEnabled &&
    baseline.gates.requireVoiceFinalizeGate &&
    !candidate.gates.requireVoiceFinalizeGate
  ) {
    errors.push("voiceEnabled config 에서 requireVoiceFinalizeGate 를 끌 수 없습니다.");
  }

  if (
    baseline.documents.requireLawyerApproval &&
    !candidate.documents.requireLawyerApproval
  ) {
    errors.push("documents.requireLawyerApproval 를 false 로 약화할 수 없습니다.");
  }

  const baselineKeys = new Set(baseline.gates.keys);
  for (const key of baselineKeys) {
    if (!candidate.gates.keys.includes(key)) {
      errors.push(`gate key 제거 금지: ${key}`);
    }
  }

  errors.push(...assertCmbGatePolicyImmutable(candidate));

  return errors;
}

export function requiresCmbVerifyPassForTransition(
  to: AibeopchinCmbStatus,
): boolean {
  return to === "VERIFY_PASS" || to === "PUBLISHED";
}

export function requiresCmbChangeReasonForTransition(
  to: AibeopchinCmbStatus,
  config: AibeopchinCmbCaseConfig,
): boolean {
  return config.audit.changeReasonRequired && (to === "REVIEW" || to === "PUBLISHED");
}
