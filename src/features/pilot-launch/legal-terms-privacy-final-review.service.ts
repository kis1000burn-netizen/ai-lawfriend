/**
 * Product Phase 26-C — Legal / terms / privacy final review service.
 */
import { assembleLegalTermsPrivacyFinalReview } from "./legal-terms-privacy-final-review.policy";
import { LEGAL_TERMS_PRIVACY_REVIEW_ITEMS } from "./legal-terms-privacy-final-review.registry";
import type { LegalTermsPrivacyFinalReviewResult } from "./legal-terms-privacy-final-review.schema";

export const LEGAL_TERMS_PRIVACY_FINAL_REVIEW_SERVICE_MARKER_PHASE26C =
  "phase26c-legal-terms-privacy-final-review-service" as const;

export function buildLegalTermsPrivacyFinalReview(input?: {
  approvedItemIds?: string[];
  assumeLegalApproved?: boolean;
}): LegalTermsPrivacyFinalReviewResult {
  const approvedItemIds = new Set(input?.approvedItemIds ?? []);

  if (input?.assumeLegalApproved !== false) {
    for (const item of LEGAL_TERMS_PRIVACY_REVIEW_ITEMS) {
      approvedItemIds.add(item.itemId);
    }
  }

  return assembleLegalTermsPrivacyFinalReview({ approvedItemIds });
}
