/**
 * CMB Runtime — CORE 위 구성 레이어 읽기 전용 (Phase 6-C)
 * 실제 gate enforcement는 Voice/Gongbuho/CORE 서비스가 담당한다.
 */
import type { AibeopchinCmbCaseConfig } from "@/cmb/core/cmb-schema";
import { getCmbCaseConfig, getCmbCaseConfigOrThrow } from "@/cmb/core/cmb-registry";

export type CmbRuntimeRole = "CLIENT" | "LAWYER" | "STAFF" | "ADMIN";

export function resolveCmbCaseConfig(caseCategory: string | null | undefined): AibeopchinCmbCaseConfig | null {
  if (!caseCategory?.trim()) return null;
  return getCmbCaseConfig(caseCategory.trim());
}

export function resolveCmbCaseConfigOrThrow(caseCategory: string): AibeopchinCmbCaseConfig {
  return getCmbCaseConfigOrThrow(caseCategory.trim());
}

export function getCmbBlocksForRole(
  config: AibeopchinCmbCaseConfig,
  role: CmbRuntimeRole,
): string[] {
  switch (role) {
    case "CLIENT":
      return config.ui.clientBlocks;
    case "LAWYER":
      return config.ui.lawyerBlocks;
    case "STAFF":
    case "ADMIN":
      return config.ui.adminBlocks;
    default:
      return config.ui.visibleBlocks;
  }
}

export function cmbRequiresVoiceFinalizeGate(config: AibeopchinCmbCaseConfig): boolean {
  return config.interview.voiceEnabled && config.gates.requireVoiceFinalizeGate;
}

export function cmbRequiresApprovedGongbuho(config: AibeopchinCmbCaseConfig): boolean {
  return config.gongbuho.requireApprovedPacketsOnly;
}

export function cmbRequiresLawyerApprovalBeforeDelivery(config: AibeopchinCmbCaseConfig): boolean {
  return (
    config.documents.requireLawyerApproval && config.gates.requireLawyerReviewBeforeFinalize
  );
}
