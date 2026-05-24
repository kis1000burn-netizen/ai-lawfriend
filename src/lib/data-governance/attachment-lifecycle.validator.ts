/**
 * Phase 19-D — Attachment lifecycle policy validator.
 */
import { getDataRetentionPolicyEntry } from "./data-retention-policy.registry";
import {
  ATTACHMENT_LIFECYCLE_DELETE_EXECUTION_LOCKED_PHASE19D,
  ATTACHMENT_LIFECYCLE_POLICY_MARKER_PHASE19D,
  ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D,
  ATTACHMENT_LIFECYCLE_TARGETS,
  type AttachmentLifecycleTarget,
} from "./attachment-lifecycle-policy";

export const ATTACHMENT_LIFECYCLE_VALIDATOR_MARKER_PHASE19D =
  "phase19d-attachment-lifecycle-validator" as const;

export type AttachmentLifecycleValidationResult = {
  ok: boolean;
  violations: string[];
};

const EXPECTED_DISPOSITION: Partial<
  Record<AttachmentLifecycleTarget, string>
> = {
  LitigationUploadedFile: "RETAIN_CASE_LIFECYCLE",
  LitigationExtractedText: "RETAIN_CASE_LIFECYCLE",
  CaseSharedDocument: "RETAIN_UNTIL_EXPIRY",
  CaseDocumentDelivery: "RETAIN_UNTIL_EXPIRY",
  CasePackageShare: "RETAIN_UNTIL_EXPIRY",
  ExternalMessageLog: "PURGE_AFTER_RETENTION",
};

export function validateAttachmentLifecyclePolicy(): AttachmentLifecycleValidationResult {
  const violations: string[] = [];

  if (!ATTACHMENT_LIFECYCLE_POLICY_MARKER_PHASE19D.includes("phase19d")) {
    violations.push("Attachment lifecycle policy marker missing.");
  }

  if (!ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D) {
    violations.push("Purge execution must stay locked until Phase 19-F.");
  }

  if (!ATTACHMENT_LIFECYCLE_DELETE_EXECUTION_LOCKED_PHASE19D) {
    violations.push("Delete execution must stay locked until Phase 19-F.");
  }

  for (const model of ATTACHMENT_LIFECYCLE_TARGETS) {
    const entry = getDataRetentionPolicyEntry(model);
    if (!entry) {
      violations.push(`${model} missing from 19-A retention registry.`);
      continue;
    }

    const expectedDisposition = EXPECTED_DISPOSITION[model];
    if (expectedDisposition && entry.disposition !== expectedDisposition) {
      violations.push(`${model} disposition drift from 19-D expectation.`);
    }

    if (entry.legalHoldDefault && entry.purgeEligible) {
      violations.push(`${model} legalHoldDefault/purgeEligible conflict.`);
    }
  }

  const litigationFile = getDataRetentionPolicyEntry("LitigationUploadedFile");
  if (litigationFile && litigationFile.purgeEligible) {
    violations.push("LitigationUploadedFile must not be purgeEligible in 19-A.");
  }

  const externalMessage = getDataRetentionPolicyEntry("ExternalMessageLog");
  if (externalMessage && externalMessage.defaultRetentionDays !== 180) {
    violations.push("ExternalMessageLog retention days must align with 180d ops policy.");
  }

  return { ok: violations.length === 0, violations };
}

export function assertAttachmentLifecyclePolicyValid(): void {
  const result = validateAttachmentLifecyclePolicy();
  if (result.ok) return;
  throw new Error(
    `Attachment lifecycle policy invalid: ${result.violations.join("; ")}`,
  );
}
