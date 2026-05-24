/**
 * Phase 19-F — Purge dry-run export (JSON · audit log · no actual delete).
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ValidationError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit-log";
import { assertAdminOnly } from "@/features/cases/case.permissions";
import {
  DATA_GOVERNANCE_PURGE_DRY_RUN_AUDIT_ACTION,
  DATA_GOVERNANCE_PURGE_DRY_RUN_ENTITY_TYPE,
  DATA_GOVERNANCE_PURGE_EXECUTION_DEFAULT_MODE,
  DATA_GOVERNANCE_RC_VERSION,
} from "@/features/data-governance/data-governance-rc-lock";
import {
  evaluateDataGovernancePurgeUnlockGates,
  validateOperatorConfirmationPhrase,
} from "@/features/data-governance/data-governance-purge-execution.policy";
import { getDataGovernancePurgePreviewSnapshot } from "@/features/data-governance/data-governance-purge-preview.service";

export const DATA_GOVERNANCE_PURGE_DRY_RUN_SERVICE_MARKER_PHASE19F =
  "phase19f-data-governance-purge-dry-run-service" as const;

export type DataGovernancePurgeDryRunInput = {
  operatorConfirmationPhrase: string;
  rollbackWarningAcknowledged: boolean;
  bundledRcVerifyPassed?: boolean;
};

export type DataGovernancePurgeDryRunExport = {
  exportedAt: string;
  version: string;
  mode: typeof DATA_GOVERNANCE_PURGE_EXECUTION_DEFAULT_MODE | "LIMITED_EXECUTION";
  operatorUserId: string;
  candidateCount: number;
  preview: Awaited<ReturnType<typeof getDataGovernancePurgePreviewSnapshot>>;
  unlockEvaluation: ReturnType<typeof evaluateDataGovernancePurgeUnlockGates>;
  actualExecutionPerformed: false;
  message: string;
};

export async function exportDataGovernancePurgeDryRun(
  currentUser: SessionUser,
  input: DataGovernancePurgeDryRunInput,
): Promise<DataGovernancePurgeDryRunExport> {
  assertAdminOnly(currentUser);

  if (!input.rollbackWarningAcknowledged) {
    throw new ValidationError("Rollback 불가 warning 확인이 필요합니다.");
  }

  if (!validateOperatorConfirmationPhrase(input.operatorConfirmationPhrase)) {
    throw new ValidationError("Operator confirmation phrase가 일치하지 않습니다.");
  }

  const preview = await getDataGovernancePurgePreviewSnapshot(currentUser);

  if (!preview.legalHoldRecheckPassed) {
    throw new ValidationError(
      "Legal hold 차단 후보가 있어 dry-run export를 진행할 수 없습니다.",
    );
  }

  const unlockEvaluation = evaluateDataGovernancePurgeUnlockGates({
    bundledRcVerifyPassed: input.bundledRcVerifyPassed ?? true,
    hasPreviewSnapshot: preview.candidateCount >= 0,
    legalHoldRecheckPassed: preview.legalHoldRecheckPassed,
    dryRunExportCompleted: true,
    operatorConfirmationValid: true,
    auditLogRecorded: false,
    rollbackWarningAcknowledged: input.rollbackWarningAcknowledged,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: DATA_GOVERNANCE_PURGE_DRY_RUN_AUDIT_ACTION,
    entityType: DATA_GOVERNANCE_PURGE_DRY_RUN_ENTITY_TYPE,
    entityId: `dry-run-${new Date().toISOString()}`,
    message: `Data governance purge dry-run export (${preview.candidateCount} candidates)`,
    metadata: {
      mode: unlockEvaluation.mode,
      candidateCount: preview.candidateCount,
      actualExecutionPerformed: false,
      dryRunOnly: unlockEvaluation.dryRunOnly,
      limitedExecutionAllowed: unlockEvaluation.actualExecutionAllowed,
      metadataOnly: true,
    },
  });

  const finalEvaluation = evaluateDataGovernancePurgeUnlockGates({
    bundledRcVerifyPassed: input.bundledRcVerifyPassed ?? true,
    hasPreviewSnapshot: true,
    legalHoldRecheckPassed: preview.legalHoldRecheckPassed,
    dryRunExportCompleted: true,
    operatorConfirmationValid: true,
    auditLogRecorded: true,
    rollbackWarningAcknowledged: input.rollbackWarningAcknowledged,
  });

  return {
    exportedAt: new Date().toISOString(),
    version: DATA_GOVERNANCE_RC_VERSION,
    mode: finalEvaluation.mode,
    operatorUserId: currentUser.id,
    candidateCount: preview.candidateCount,
    preview,
    unlockEvaluation: finalEvaluation,
    actualExecutionPerformed: false,
    message: finalEvaluation.actualExecutionAllowed
      ? "Limited execution flag enabled — gates passed. Actual purge job wiring is still operator-controlled."
      : "Dry-run export only. Purge/delete/blob reclaim not executed.",
  };
}
