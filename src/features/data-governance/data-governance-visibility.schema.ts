/**
 * Phase 19-E — Admin Data Governance visibility DTOs.
 */
import type { AttachmentLifecycleEligibilityResult } from "@/lib/data-governance/attachment-lifecycle-policy";
import type { StorageOrphanCandidate } from "@/lib/data-governance/attachment-lifecycle-orphan-detection.service";

export const DATA_GOVERNANCE_VISIBILITY_SCHEMA_MARKER_PHASE19E =
  "phase19e-data-governance-visibility-schema" as const;

export type DataGovernanceVisibilityCategory =
  | "deletion_candidate"
  | "expiry_candidate"
  | "share_expiry"
  | "external_retention"
  | "orphan_dry_run"
  | "legal_hold_blocked";

export type DataGovernanceVisibilityItem = {
  id: string;
  model: string;
  category: DataGovernanceVisibilityCategory;
  caseId: string | null;
  summary: string;
  expiresAt: string | null;
  effectiveStatus: string | null;
  createdAt: string | null;
  eligibility: AttachmentLifecycleEligibilityResult;
};

export type DataGovernanceOrphanVisibilityItem = StorageOrphanCandidate & {
  eligibility: AttachmentLifecycleEligibilityResult;
  category: "orphan_dry_run";
};

export type DataGovernanceVisibilitySummary = {
  litigationFileSamples: number;
  litigationExtractedSamples: number;
  sharedDocumentSamples: number;
  documentDeliverySamples: number;
  packageShareSamples: number;
  externalMessageSamples: number;
  orphanSamples: number;
  expiryCandidateCount: number;
  deletionCandidateCount: number;
  legalHoldBlockedCount: number;
};

export type DataGovernanceVisibilitySnapshot = {
  capturedAt: string;
  version: string;
  purgeExecutionLocked: {
    phase19a: boolean;
    phase19cAuditLog: boolean;
    phase19dAttachment: boolean;
    phase19eUi: boolean;
  };
  executionDisabledMessage: string;
  summary: DataGovernanceVisibilitySummary;
  litigationFiles: DataGovernanceVisibilityItem[];
  litigationExtracted: DataGovernanceVisibilityItem[];
  sharedDocuments: DataGovernanceVisibilityItem[];
  documentDeliveries: DataGovernanceVisibilityItem[];
  packageShares: DataGovernanceVisibilityItem[];
  externalMessages: DataGovernanceVisibilityItem[];
  orphans: DataGovernanceOrphanVisibilityItem[];
};
