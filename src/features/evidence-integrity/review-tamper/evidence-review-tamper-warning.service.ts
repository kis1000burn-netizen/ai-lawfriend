/**
 * Product Phase 42-D — EvidenceReviewTamperWarning service.
 */
import {
  EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
  EVIDENCE_REVIEW_TAMPER_WARNING_ITEMS,
} from "./evidence-review-tamper-warning.registry";
import { assembleEvidenceReviewTamperWarning } from "./evidence-review-tamper-warning.policy";
import type { EvidenceReviewTamperWarningResult } from "./evidence-review-tamper-warning.schema";

export const EVIDENCE_REVIEW_TAMPER_WARNING_SERVICE_MARKER_42D =
  "phase42d-evidence-review-tamper-warning-service" as const;

export function buildEvidenceReviewTamperWarning(input?: {
  evidenceIntegrityScopeSlug?: string;
  definedItemIds?: string[];
}): EvidenceReviewTamperWarningResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      EVIDENCE_REVIEW_TAMPER_WARNING_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleEvidenceReviewTamperWarning({
    evidenceIntegrityScopeSlug: input?.evidenceIntegrityScopeSlug ?? EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
