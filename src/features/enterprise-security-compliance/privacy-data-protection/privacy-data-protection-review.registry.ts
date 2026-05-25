/**
 * Product Phase 32-B — Privacy / data protection review items SSOT.
 */
import type { PrivacyDataProtectionReviewResult } from "./privacy-data-protection-review.schema";

export const PRIVACY_DATA_PROTECTION_REGISTRY_MARKER_PHASE32B =
  "phase32b-privacy-data-protection-registry" as const;

type PrivacyReviewItem = Omit<PrivacyDataProtectionReviewResult["items"][number], "reviewed">;

export const PRIVACY_REVIEW_ITEMS: PrivacyReviewItem[] = [
  { itemId: "PII_HANDLING", label: "PII handling policy", required: true },
  { itemId: "LEGAL_SENSITIVE_DATA", label: "Legal sensitive data handling", required: true },
  { itemId: "REDACTION_POLICY", label: "Redaction policy (Phase 19-B)", required: true },
  { itemId: "CLIENT_SAFE_DISCLOSURE", label: "Client-safe disclosure pack", required: true },
  { itemId: "VOICE_TRANSCRIPT_POLICY", label: "Voice transcript policy", required: true },
  { itemId: "ATTACHMENT_LIFECYCLE", label: "Attachment lifecycle (Phase 19-D)", required: true },
  { itemId: "DATA_RETENTION", label: "Data retention policy (Phase 19-A)", required: true },
];
