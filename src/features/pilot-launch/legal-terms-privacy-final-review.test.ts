import { describe, expect, it } from "vitest";
import { assembleLegalTermsPrivacyFinalReview } from "./legal-terms-privacy-final-review.policy";
import { LEGAL_TERMS_PRIVACY_REVIEW_ITEMS } from "./legal-terms-privacy-final-review.registry";
import { buildLegalTermsPrivacyFinalReview } from "./legal-terms-privacy-final-review.service";

describe("legal-terms-privacy-final-review (Phase 26-C)", () => {
  it("lists required legal review items", () => {
    expect(LEGAL_TERMS_PRIVACY_REVIEW_ITEMS.some((i) => i.itemId === "PRIVACY_POLICY")).toBe(
      true,
    );
  });

  it("marks legalReviewComplete when all approved", () => {
    const result = assembleLegalTermsPrivacyFinalReview({
      approvedItemIds: new Set(LEGAL_TERMS_PRIVACY_REVIEW_ITEMS.map((i) => i.itemId)),
    });
    expect(result.legalReviewComplete).toBe(true);
  });

  it("defaults to approved when assumeLegalApproved", () => {
    const result = buildLegalTermsPrivacyFinalReview();
    expect(result.legalReviewComplete).toBe(true);
  });
});
