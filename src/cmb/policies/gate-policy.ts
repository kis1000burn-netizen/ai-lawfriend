/**
 * CMB가 CORE gate를 약화할 수 없는 불변 정책 (Phase 6-B)
 * @see docs/cmb/AIBEOPCHIN_CMB_VERIFY_POLICY.md §2
 */

import type { AibeopchinCmbCaseConfig } from "@/cmb/core/cmb-schema";

/** CMB config에서 false 로 둘 수 없는 gate (CORE 고정) */
export const CMB_IMMUTABLE_GATE_REQUIREMENTS = {
  requireApprovedPacketsOnly: true,
  requireLawyerReviewBeforeFinalize: true,
  requireVoiceFinalizeGateWhenVoiceEnabled: true,
} as const;

export function assertCmbGatePolicyImmutable(config: AibeopchinCmbCaseConfig): string[] {
  const errors: string[] = [];

  if (!config.gongbuho.requireApprovedPacketsOnly) {
    errors.push(
      `${config.caseType}: gongbuho.requireApprovedPacketsOnly must stay true (CORE gate)`,
    );
  }

  if (!config.gates.requireLawyerReviewBeforeFinalize) {
    errors.push(
      `${config.caseType}: gates.requireLawyerReviewBeforeFinalize must stay true (CORE gate)`,
    );
  }

  if (
    config.interview.voiceEnabled &&
    CMB_IMMUTABLE_GATE_REQUIREMENTS.requireVoiceFinalizeGateWhenVoiceEnabled &&
    !config.gates.requireVoiceFinalizeGate
  ) {
    errors.push(
      `${config.caseType}: voiceEnabled requires gates.requireVoiceFinalizeGate (Voice RC)`,
    );
  }

  if (
    config.documents.requireLawyerApproval &&
    !config.gates.keys.includes("REQUIRE_LAWYER_APPROVAL_BEFORE_DELIVERY")
  ) {
    errors.push(
      `${config.caseType}: requireLawyerApproval requires REQUIRE_LAWYER_APPROVAL_BEFORE_DELIVERY gate key`,
    );
  }

  return errors;
}
