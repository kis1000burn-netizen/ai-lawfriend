/**
 * Product Phase 31-E — Partner quality / compliance review items SSOT.
 */
import type { PartnerQualityComplianceReviewResult } from "./partner-quality-compliance.schema";

export const PARTNER_QUALITY_COMPLIANCE_REGISTRY_MARKER_PHASE31E =
  "phase31e-partner-quality-compliance-registry" as const;

type PartnerComplianceItem = Omit<
  PartnerQualityComplianceReviewResult["items"][number],
  "approved"
>;

export const PARTNER_COMPLIANCE_ITEMS: PartnerComplianceItem[] = [
  { itemId: "BAR_ADMISSION_VERIFIED", label: "Bar admission verified", required: true },
  { itemId: "CONFLICT_CHECK_POLICY", label: "Conflict check policy attested", required: true },
  {
    itemId: "DATA_HANDLING_ATTESTATION",
    label: "Data handling attestation signed",
    required: true,
  },
  { itemId: "SERVICE_LEVEL_COMMITMENT", label: "Service level commitment documented", required: true },
  { itemId: "BRAND_GUIDELINE_ACK", label: "Brand guideline acknowledgment", required: false },
];
