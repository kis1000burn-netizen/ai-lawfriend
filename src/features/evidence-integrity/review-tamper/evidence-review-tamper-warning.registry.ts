/**
 * Product Phase 42-D — EvidenceReviewTamperWarning SSOT.
 */
import type { EvidenceReviewTamperWarningResult } from "./evidence-review-tamper-warning.schema";

export const EVIDENCE_REVIEW_TAMPER_WARNING_REGISTRY_MARKER_42D =
  "phase42d-evidence-review-tamper-warning-registry" as const;

export const EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG = "evidence-integrity-001" as const;

type EvidenceReviewTamperWarningItem = Omit<EvidenceReviewTamperWarningResult["items"][number], "defined">;

export const EVIDENCE_REVIEW_TAMPER_WARNING_ITEMS: EvidenceReviewTamperWarningItem[] = [
  { itemId: "EVIDENCE_REVIEW_STATUS", label: "Evidence review status tracking", required: true },
  { itemId: "TAMPER_WARNING", label: "Tamper warning signal", required: true },
  { itemId: "HASH_MISMATCH_ALERT", label: "Hash mismatch alert", required: true },
  { itemId: "REVIEW_LAWYER_SIGNOFF", label: "Lawyer signoff on evidence review", required: true },
];
