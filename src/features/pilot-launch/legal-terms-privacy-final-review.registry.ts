/**
 * Product Phase 26-C — Legal / terms / privacy review items SSOT.
 */
import type { LegalTermsPrivacyFinalReviewResult } from "./legal-terms-privacy-final-review.schema";

export const LEGAL_TERMS_PRIVACY_FINAL_REVIEW_REGISTRY_MARKER_PHASE26C =
  "phase26c-legal-terms-privacy-final-review-registry" as const;

type ReviewItem = Omit<LegalTermsPrivacyFinalReviewResult["items"][number], "approved" | "notes">;

export const LEGAL_TERMS_PRIVACY_REVIEW_ITEMS: ReviewItem[] = [
  {
    itemId: "TERMS_OF_SERVICE",
    label: "Terms of Service · commercial use",
    required: true,
    docPath: "docs/project-governance/AIBEOPCHIN_6_9_2_NOTICE_COPY_CANONICAL.md",
  },
  {
    itemId: "PRIVACY_POLICY",
    label: "Privacy policy · PII handling",
    required: true,
    docPath: "docs/project-governance/AIBEOPCHIN_6_9_PRIVACY_SECURITY_NOTICE_FINALIZATION_START.md",
  },
  {
    itemId: "DATA_PROCESSING",
    label: "Data processing · retention (19-F)",
    required: true,
    docPath: "docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md",
  },
  {
    itemId: "COOKIE_NOTICE",
    label: "Cookie · session notice",
    required: true,
    docPath: "docs/project-governance/AIBEOPCHIN_6_9_1_NOTICE_EXPOSURE_MAPPING.md",
  },
  {
    itemId: "LEGAL_DISCLAIMER",
    label: "Legal disclaimer · AI-assisted output",
    required: true,
    docPath: "docs/ai/AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_PREDEPLOY_CLOSURE_CHECKLIST.md",
  },
];
