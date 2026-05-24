/**
 * Phase 14-A — Litigation Command Center access policy.
 */
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError } from "@/lib/errors";

export const PHASE14A_LITIGATION_COMMAND_CENTER_POLICY_MARKER =
  "PHASE14A_LITIGATION_COMMAND_CENTER_POLICY" as const;

export function assertCanReadLitigationCommandCenter(
  access: CaseAccessContext,
): void {
  if (!access.canRead) {
    throw new ForbiddenError("소송 지휘실 열람 권한이 없습니다.");
  }
}

export function canRunLitigationCommandCenterActions(
  access: CaseAccessContext,
): boolean {
  return (
    access.isAssignedLawyer || access.isAssignedStaff || access.isAdmin
  );
}
