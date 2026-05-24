/**
 * Phase 19-D — Attachment lifecycle / expiry policy (19-A tier aligned · no purge/delete jobs).
 *
 * 첨부·추출본문·공유문서·보안전달 링크 — 만료·보존·삭제 가능성을 분리 판정.
 * 실제 purge/delete/blob reclaim은 Phase 19-F RC 이후.
 */
import { getDataRetentionPolicyEntry } from "./data-retention-policy.registry";
import { resolveCasePackageShareStatus } from "@/features/case-package/case-package-share-policy-utils";
import type { CasePackageShareStatus } from "@/features/case-package/case-package-share-policy";

export const ATTACHMENT_LIFECYCLE_POLICY_MARKER_PHASE19D =
  "phase19d-attachment-lifecycle-policy" as const;

export const ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D = true as const;

export const ATTACHMENT_LIFECYCLE_DELETE_EXECUTION_LOCKED_PHASE19D = true as const;

export const ATTACHMENT_LIFECYCLE_TARGETS = [
  "LitigationUploadedFile",
  "LitigationExtractedText",
  "CaseSharedDocument",
  "CaseDocumentDelivery",
  "CasePackageShare",
  "ExternalMessageLog",
] as const;

export type AttachmentLifecycleTarget = (typeof ATTACHMENT_LIFECYCLE_TARGETS)[number];

export type AttachmentLifecycleBlockedReason =
  | "PURGE_EXECUTION_LOCKED"
  | "DELETE_EXECUTION_LOCKED"
  | "LEGAL_HOLD_ACTIVE"
  | "CASE_NOT_CLOSED"
  | "RETAIN_CASE_LIFECYCLE"
  | "NOT_EXPIRED"
  | "SHARE_ACTIVE"
  | "WITHIN_RETENTION_WINDOW"
  | "MISSING_EXPIRY_SIGNAL"
  | "NO_SECURE_LINK_METADATA";

export type AttachmentLifecycleEligibilityResult = {
  eligible: boolean;
  blockedReason: AttachmentLifecycleBlockedReason | null;
  model: AttachmentLifecycleTarget;
};

export type CaseSharedDocumentStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

function blocked(
  model: AttachmentLifecycleTarget,
  reason: AttachmentLifecycleBlockedReason,
): AttachmentLifecycleEligibilityResult {
  return { eligible: false, blockedReason: reason, model };
}

function eligible(model: AttachmentLifecycleTarget): AttachmentLifecycleEligibilityResult {
  return { eligible: true, blockedReason: null, model };
}

export function isAttachmentLifecyclePurgeExecutionLocked(): boolean {
  return ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D;
}

export function assertAttachmentLifecyclePurgeNotExecuted(): void {
  if (ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D) {
    throw new Error(
      "Attachment lifecycle purge/delete is locked until Phase 19-F RC.",
    );
  }
}

export function guardAttachmentLifecycleLegalHold(input: {
  legalHoldActive: boolean;
  legalHoldDefaultFromRegistry: boolean;
  action: "PURGE" | "DELETE" | "BLOB_RECLAIM" | "EXPIRE_DB_SYNC";
}): { allowed: boolean; blockedReason: AttachmentLifecycleBlockedReason | null } {
  void input.legalHoldDefaultFromRegistry;
  if (input.legalHoldActive) {
    if (
      input.action === "PURGE" ||
      input.action === "DELETE" ||
      input.action === "BLOB_RECLAIM"
    ) {
      return { allowed: false, blockedReason: "LEGAL_HOLD_ACTIVE" };
    }
  }
  return { allowed: true, blockedReason: null };
}

function applyPurgeExecutionLock(
  result: AttachmentLifecycleEligibilityResult,
): AttachmentLifecycleEligibilityResult {
  if (!result.eligible) {
    return result;
  }
  if (ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D) {
    return blocked(result.model, "PURGE_EXECUTION_LOCKED");
  }
  return result;
}

function isPastExpiry(
  expiresAt: Date | string | null | undefined,
  reference: Date,
): boolean {
  if (!expiresAt) {
    return false;
  }
  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.getTime() <= reference.getTime();
}

export function resolveCaseSharedDocumentEffectiveStatus(input: {
  shareStatus: CaseSharedDocumentStatus | string;
  expiresAt: Date | null;
  reference?: Date;
}): CaseSharedDocumentStatus {
  const reference = input.reference ?? new Date();
  if (input.shareStatus === "REVOKED") {
    return "REVOKED";
  }
  if (input.shareStatus === "EXPIRED" || isPastExpiry(input.expiresAt, reference)) {
    return "EXPIRED";
  }
  return "ACTIVE";
}

export function isCaseDocumentDeliveryTokenExpired(
  tokenExpiresAt: Date,
  reference: Date = new Date(),
): boolean {
  return tokenExpiresAt.getTime() <= reference.getTime();
}

export function evaluateLitigationUploadedFileLifecycleEligibility(input: {
  caseClosed: boolean;
  legalHoldActive: boolean;
}): AttachmentLifecycleEligibilityResult {
  const model = "LitigationUploadedFile" as const;
  const entry = getDataRetentionPolicyEntry(model);
  const legalHold = guardAttachmentLifecycleLegalHold({
    legalHoldActive: input.legalHoldActive,
    legalHoldDefaultFromRegistry: entry?.legalHoldDefault ?? true,
    action: "BLOB_RECLAIM",
  });
  if (!legalHold.allowed) {
    return blocked(model, legalHold.blockedReason ?? "LEGAL_HOLD_ACTIVE");
  }
  if (!input.caseClosed) {
    return applyPurgeExecutionLock(blocked(model, "CASE_NOT_CLOSED"));
  }
  if (!entry?.purgeEligible) {
    return applyPurgeExecutionLock(blocked(model, "RETAIN_CASE_LIFECYCLE"));
  }
  return applyPurgeExecutionLock(eligible(model));
}

export function evaluateLitigationExtractedTextLifecycleEligibility(input: {
  caseClosed: boolean;
  legalHoldActive: boolean;
  hasUploadedFileReference: boolean;
}): AttachmentLifecycleEligibilityResult {
  const model = "LitigationExtractedText" as const;
  const entry = getDataRetentionPolicyEntry(model);
  const legalHold = guardAttachmentLifecycleLegalHold({
    legalHoldActive: input.legalHoldActive,
    legalHoldDefaultFromRegistry: entry?.legalHoldDefault ?? true,
    action: "DELETE",
  });
  if (!legalHold.allowed) {
    return blocked(model, legalHold.blockedReason ?? "LEGAL_HOLD_ACTIVE");
  }
  if (!input.caseClosed) {
    return applyPurgeExecutionLock(blocked(model, "CASE_NOT_CLOSED"));
  }
  if (!input.hasUploadedFileReference) {
    return applyPurgeExecutionLock(blocked(model, "MISSING_EXPIRY_SIGNAL"));
  }
  if (!entry?.purgeEligible) {
    return applyPurgeExecutionLock(blocked(model, "RETAIN_CASE_LIFECYCLE"));
  }
  return applyPurgeExecutionLock(eligible(model));
}

export function evaluateCaseSharedDocumentExpiryEligibility(input: {
  shareStatus: string;
  expiresAt: Date | null;
  legalHoldActive?: boolean;
  reference?: Date;
}): AttachmentLifecycleEligibilityResult {
  const model = "CaseSharedDocument" as const;
  const reference = input.reference ?? new Date();
  const entry = getDataRetentionPolicyEntry(model);
  const legalHold = guardAttachmentLifecycleLegalHold({
    legalHoldActive: input.legalHoldActive ?? false,
    legalHoldDefaultFromRegistry: entry?.legalHoldDefault ?? false,
    action: "PURGE",
  });
  if (!legalHold.allowed) {
    return blocked(model, legalHold.blockedReason ?? "LEGAL_HOLD_ACTIVE");
  }

  const effective = resolveCaseSharedDocumentEffectiveStatus({
    shareStatus: input.shareStatus,
    expiresAt: input.expiresAt,
    reference,
  });
  if (effective === "ACTIVE") {
    return applyPurgeExecutionLock(blocked(model, "SHARE_ACTIVE"));
  }
  if (effective === "REVOKED" || effective === "EXPIRED") {
    return applyPurgeExecutionLock(eligible(model));
  }
  return applyPurgeExecutionLock(blocked(model, "NOT_EXPIRED"));
}

export function evaluateCaseDocumentDeliveryExpiryEligibility(input: {
  tokenExpiresAt: Date;
  deliveryStatus: string;
  legalHoldActive?: boolean;
  reference?: Date;
}): AttachmentLifecycleEligibilityResult {
  const model = "CaseDocumentDelivery" as const;
  const reference = input.reference ?? new Date();
  const entry = getDataRetentionPolicyEntry(model);
  const legalHold = guardAttachmentLifecycleLegalHold({
    legalHoldActive: input.legalHoldActive ?? false,
    legalHoldDefaultFromRegistry: entry?.legalHoldDefault ?? false,
    action: "PURGE",
  });
  if (!legalHold.allowed) {
    return blocked(model, legalHold.blockedReason ?? "LEGAL_HOLD_ACTIVE");
  }

  if (!isCaseDocumentDeliveryTokenExpired(input.tokenExpiresAt, reference)) {
    return applyPurgeExecutionLock(blocked(model, "NOT_EXPIRED"));
  }
  return applyPurgeExecutionLock(eligible(model));
}

export function evaluateCasePackageShareExpiryEligibility(input: {
  status: CasePackageShareStatus | string;
  expiresAt?: Date | string | null;
  revokedAt?: Date | string | null;
  legalHoldActive?: boolean;
  reference?: Date;
}): AttachmentLifecycleEligibilityResult {
  const model = "CasePackageShare" as const;
  const entry = getDataRetentionPolicyEntry(model);
  const legalHold = guardAttachmentLifecycleLegalHold({
    legalHoldActive: input.legalHoldActive ?? false,
    legalHoldDefaultFromRegistry: entry?.legalHoldDefault ?? false,
    action: "PURGE",
  });
  if (!legalHold.allowed) {
    return blocked(model, legalHold.blockedReason ?? "LEGAL_HOLD_ACTIVE");
  }

  const resolved = resolveCasePackageShareStatus({
    status: (input.status as CasePackageShareStatus) ?? "ACTIVE",
    expiresAt: input.expiresAt,
    revokedAt: input.revokedAt,
  });
  if (resolved === "ACTIVE") {
    return applyPurgeExecutionLock(blocked(model, "SHARE_ACTIVE"));
  }
  return applyPurgeExecutionLock(eligible(model));
}

export const EXTERNAL_MESSAGE_SECURE_LINK_METADATA_KEYS = [
  "portalPath",
  "metadataOnly",
  "documentTitle",
] as const;

export function isExternalMessageSecureLinkMetadata(payloadSummaryJson: unknown): boolean {
  if (!payloadSummaryJson || typeof payloadSummaryJson !== "object") {
    return false;
  }
  const record = payloadSummaryJson as Record<string, unknown>;
  return (
    record.metadataOnly === true &&
    typeof record.portalPath === "string" &&
    record.portalPath.length > 0
  );
}

export function getExternalMessageLogRetentionDays(): number {
  return getDataRetentionPolicyEntry("ExternalMessageLog")?.defaultRetentionDays ?? 180;
}

export function evaluateExternalMessageLogSecureLinkEligibility(input: {
  createdAt: Date;
  payloadSummaryJson: unknown;
  linkedDeliveryTokenExpired?: boolean;
  reference?: Date;
}): AttachmentLifecycleEligibilityResult {
  const model = "ExternalMessageLog" as const;
  const reference = input.reference ?? new Date();
  const retentionDays = getExternalMessageLogRetentionDays();
  const cutoff = new Date(
    reference.getTime() - retentionDays * 24 * 60 * 60 * 1000,
  );

  if (!isExternalMessageSecureLinkMetadata(input.payloadSummaryJson)) {
    return applyPurgeExecutionLock(blocked(model, "NO_SECURE_LINK_METADATA"));
  }

  if (input.createdAt.getTime() >= cutoff.getTime()) {
    return applyPurgeExecutionLock(blocked(model, "WITHIN_RETENTION_WINDOW"));
  }

  if (input.linkedDeliveryTokenExpired === false) {
    return applyPurgeExecutionLock(blocked(model, "NOT_EXPIRED"));
  }

  return applyPurgeExecutionLock(eligible(model));
}

export function assertCaseSharedDocumentAccessAllowed(input: {
  shareStatus: string;
  expiresAt: Date | null;
  reference?: Date;
}): void {
  const effective = resolveCaseSharedDocumentEffectiveStatus(input);
  if (effective === "REVOKED") {
    throw new Error("SHARE_REVOKED");
  }
  if (effective === "EXPIRED") {
    throw new Error("SHARE_EXPIRED");
  }
}
