/**
 * Product Phase 42-D — EvidenceReviewTamperWarning policy SSOT.
 */
import { EVIDENCE_REVIEW_TAMPER_WARNING_ITEMS } from "./evidence-review-tamper-warning.registry";
import type { EvidenceReviewTamperWarningResult } from "./evidence-review-tamper-warning.schema";
import { EVIDENCE_REVIEW_TAMPER_WARNING_VERSION } from "./evidence-review-tamper-warning.schema";

export const EVIDENCE_REVIEW_TAMPER_WARNING_POLICY_MARKER_42D =
  "phase42d-evidence-review-tamper-warning-policy" as const;

export const EVIDENCE_REVIEW_TAMPER_WARNING_GATE_MARKER_42D =
  "phase42d-evidence-review-tamper-warning-gate" as const;

export const EVIDENCE_INTEGRITY_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const EVIDENCE_INTEGRITY_BOUNDARY_TAMPER_WARNING_REQUIRED =
  "TAMPER_WARNING_REQUIRED" as const;

export function assembleEvidenceReviewTamperWarning(input: {
  evidenceIntegrityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): EvidenceReviewTamperWarningResult {
  const items = EVIDENCE_REVIEW_TAMPER_WARNING_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: EVIDENCE_REVIEW_TAMPER_WARNING_VERSION,
    evidenceIntegrityScopeSlug: input.evidenceIntegrityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    evidenceReviewTamperWarningReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
