/**
 * Product Phase 26-C — Legal / terms / privacy final review policy SSOT.
 */
import { LEGAL_TERMS_PRIVACY_REVIEW_ITEMS } from "./legal-terms-privacy-final-review.registry";
import type { LegalTermsPrivacyFinalReviewResult } from "./legal-terms-privacy-final-review.schema";
import { LEGAL_TERMS_PRIVACY_FINAL_REVIEW_VERSION } from "./legal-terms-privacy-final-review.schema";

export const LEGAL_TERMS_PRIVACY_FINAL_REVIEW_POLICY_MARKER_PHASE26C =
  "phase26c-legal-terms-privacy-final-review-policy" as const;

export function assembleLegalTermsPrivacyFinalReview(input: {
  approvedItemIds: Set<string>;
  generatedAt?: string;
}): LegalTermsPrivacyFinalReviewResult {
  const items = LEGAL_TERMS_PRIVACY_REVIEW_ITEMS.map((item) => {
    const approved = input.approvedItemIds.has(item.itemId);
    return {
      ...item,
      approved,
      notes: approved ? [] : [`pending approval: ${item.itemId}`],
    };
  });

  const required = items.filter((item) => item.required);
  const approvedRequired = required.filter((item) => item.approved).length;
  const approvalRate =
    required.length === 0 ? 100 : Math.round((approvedRequired / required.length) * 100);

  return {
    version: LEGAL_TERMS_PRIVACY_FINAL_REVIEW_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    approvalRate,
    legalReviewComplete: approvedRequired === required.length,
  };
}
