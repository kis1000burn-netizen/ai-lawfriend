/**
 * Phase 19-F — Purge execution unlock gates (dry-run default · limited execution conditional).
 */
import {
  DATA_GOVERNANCE_PURGE_EXECUTION_DEFAULT_MODE,
  DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE,
  DATA_GOVERNANCE_PURGE_ROLLBACK_WARNING,
  isDataGovernancePurgeLimitedExecutionEnabled,
} from "./data-governance-rc-lock";

export const DATA_GOVERNANCE_PURGE_EXECUTION_POLICY_MARKER_PHASE19F =
  "phase19f-data-governance-purge-execution-policy" as const;

export const DATA_GOVERNANCE_PURGE_UNLOCK_GATES = [
  "BUNDLED_RC_VERIFY",
  "PREVIEW_SNAPSHOT",
  "LEGAL_HOLD_RECHECK",
  "DRY_RUN_EXPORT",
  "OPERATOR_CONFIRMATION",
  "AUDIT_LOG",
  "LIMITED_EXECUTION_FLAG",
  "ROLLBACK_WARNING_ACK",
] as const;

export type DataGovernancePurgeUnlockGateId =
  (typeof DATA_GOVERNANCE_PURGE_UNLOCK_GATES)[number];

export type DataGovernancePurgeUnlockGateStatus = {
  id: DataGovernancePurgeUnlockGateId;
  label: string;
  passed: boolean;
  detail: string;
};

export type DataGovernancePurgeUnlockEvaluation = {
  mode: typeof DATA_GOVERNANCE_PURGE_EXECUTION_DEFAULT_MODE | "LIMITED_EXECUTION";
  allGatesPassed: boolean;
  dryRunOnly: boolean;
  actualExecutionAllowed: boolean;
  gates: DataGovernancePurgeUnlockGateStatus[];
  rollbackWarning: string;
  operatorConfirmationPhrase: string;
};

const GATE_LABELS: Record<DataGovernancePurgeUnlockGateId, string> = {
  BUNDLED_RC_VERIFY: "19-A~E bundled verify",
  PREVIEW_SNAPSHOT: "Purge 대상 preview snapshot",
  LEGAL_HOLD_RECHECK: "Legal hold 차단 재검증",
  DRY_RUN_EXPORT: "Dry-run export",
  OPERATOR_CONFIRMATION: "Operator confirmation phrase",
  AUDIT_LOG: "Audit log 기록",
  LIMITED_EXECUTION_FLAG: "Limited execution flag",
  ROLLBACK_WARNING_ACK: "Rollback 불가 warning 확인",
};

export function validateOperatorConfirmationPhrase(phrase: string | undefined): boolean {
  if (!phrase?.trim()) return false;
  return phrase.trim() === DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE;
}

export function evaluateDataGovernancePurgeUnlockGates(input: {
  bundledRcVerifyPassed: boolean;
  hasPreviewSnapshot: boolean;
  legalHoldRecheckPassed: boolean;
  dryRunExportCompleted: boolean;
  operatorConfirmationValid: boolean;
  auditLogRecorded: boolean;
  rollbackWarningAcknowledged: boolean;
}): DataGovernancePurgeUnlockEvaluation {
  const limitedEnabled = isDataGovernancePurgeLimitedExecutionEnabled();

  const gates: DataGovernancePurgeUnlockGateStatus[] = [
    {
      id: "BUNDLED_RC_VERIFY",
      label: GATE_LABELS.BUNDLED_RC_VERIFY,
      passed: input.bundledRcVerifyPassed,
      detail: input.bundledRcVerifyPassed
        ? "verify:aibeopchin-data-governance-rc 통과"
        : "RC bundled verify 미완료",
    },
    {
      id: "PREVIEW_SNAPSHOT",
      label: GATE_LABELS.PREVIEW_SNAPSHOT,
      passed: input.hasPreviewSnapshot,
      detail: input.hasPreviewSnapshot
        ? "preview snapshot 생성됨"
        : "preview snapshot 없음",
    },
    {
      id: "LEGAL_HOLD_RECHECK",
      label: GATE_LABELS.LEGAL_HOLD_RECHECK,
      passed: input.legalHoldRecheckPassed,
      detail: input.legalHoldRecheckPassed
        ? "legal hold 차단 후보 없음"
        : "legal hold 차단 후보 존재 — 실행 불가",
    },
    {
      id: "DRY_RUN_EXPORT",
      label: GATE_LABELS.DRY_RUN_EXPORT,
      passed: input.dryRunExportCompleted,
      detail: input.dryRunExportCompleted
        ? "dry-run export 완료"
        : "dry-run export 필요",
    },
    {
      id: "OPERATOR_CONFIRMATION",
      label: GATE_LABELS.OPERATOR_CONFIRMATION,
      passed: input.operatorConfirmationValid,
      detail: input.operatorConfirmationValid
        ? "confirmation phrase 일치"
        : `phrase: ${DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE}`,
    },
    {
      id: "AUDIT_LOG",
      label: GATE_LABELS.AUDIT_LOG,
      passed: input.auditLogRecorded,
      detail: input.auditLogRecorded
        ? "AuditLog 기록됨"
        : "dry-run 시 AuditLog 기록 필요",
    },
    {
      id: "LIMITED_EXECUTION_FLAG",
      label: GATE_LABELS.LIMITED_EXECUTION_FLAG,
      passed: limitedEnabled,
      detail: limitedEnabled
        ? `${process.env.NODE_ENV ?? "env"} limited execution enabled`
        : "DATA_GOVERNANCE_PURGE_LIMITED_EXECUTION_ENABLED≠true",
    },
    {
      id: "ROLLBACK_WARNING_ACK",
      label: GATE_LABELS.ROLLBACK_WARNING_ACK,
      passed: input.rollbackWarningAcknowledged,
      detail: input.rollbackWarningAcknowledged
        ? "rollback warning 확인됨"
        : "rollback warning 미확인",
    },
  ];

  const allGatesPassed = gates.every((gate) => gate.passed);
  const dryRunReady =
    input.bundledRcVerifyPassed &&
    input.hasPreviewSnapshot &&
    input.legalHoldRecheckPassed &&
    input.operatorConfirmationValid &&
    input.rollbackWarningAcknowledged;

  return {
    mode: limitedEnabled && allGatesPassed ? "LIMITED_EXECUTION" : "DRY_RUN",
    allGatesPassed,
    dryRunOnly: !limitedEnabled || !allGatesPassed,
    actualExecutionAllowed: limitedEnabled && allGatesPassed,
    gates,
    rollbackWarning: DATA_GOVERNANCE_PURGE_ROLLBACK_WARNING,
    operatorConfirmationPhrase: DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE,
  };
}

export function assertDataGovernancePurgeExecutionNotAllowed(): void {
  const evaluation = evaluateDataGovernancePurgeUnlockGates({
    bundledRcVerifyPassed: false,
    hasPreviewSnapshot: false,
    legalHoldRecheckPassed: false,
    dryRunExportCompleted: false,
    operatorConfirmationValid: false,
    auditLogRecorded: false,
    rollbackWarningAcknowledged: false,
  });
  if (evaluation.actualExecutionAllowed) {
    throw new Error("Unexpected purge execution unlock state.");
  }
}
