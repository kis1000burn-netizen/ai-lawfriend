import { DataGovernanceConsole } from "@/components/admin/operations/data-governance-console";
import { evaluateDataGovernancePurgeUnlockGates } from "@/features/data-governance/data-governance-purge-execution.policy";
import { getDataGovernancePurgePreviewSnapshot } from "@/features/data-governance/data-governance-purge-preview.service";
import { getDataGovernanceVisibilitySnapshot } from "@/features/data-governance/data-governance-visibility.service";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminDataGovernancePage() {
  const user = await requireAdmin();
  const [snapshot, preview] = await Promise.all([
    getDataGovernanceVisibilitySnapshot(user),
    getDataGovernancePurgePreviewSnapshot(user),
  ]);

  const unlockEvaluation = evaluateDataGovernancePurgeUnlockGates({
    bundledRcVerifyPassed: true,
    hasPreviewSnapshot: true,
    legalHoldRecheckPassed: preview.legalHoldRecheckPassed,
    dryRunExportCompleted: false,
    operatorConfirmationValid: false,
    auditLogRecorded: false,
    rollbackWarningAcknowledged: false,
  });

  return (
    <DataGovernanceConsole
      snapshot={snapshot}
      preview={preview}
      unlockEvaluation={unlockEvaluation}
    />
  );
}
