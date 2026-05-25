/**
 * Product Phase 31-E — Partner quality / compliance review service.
 */
import { PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG } from "../partner-program/partner-program-model.registry";
import { PARTNER_COMPLIANCE_ITEMS } from "./partner-quality-compliance.registry";
import { assemblePartnerQualityComplianceReview } from "./partner-quality-compliance.policy";
import type { PartnerQualityComplianceReviewResult } from "./partner-quality-compliance.schema";

export const PARTNER_QUALITY_COMPLIANCE_SERVICE_MARKER_PHASE31E =
  "phase31e-partner-quality-compliance-service" as const;

export function buildPartnerQualityComplianceReview(input?: {
  networkSlug?: string;
  approvedItemIds?: string[];
}): PartnerQualityComplianceReviewResult {
  const approvedItemIds = new Set(
    input?.approvedItemIds ??
      PARTNER_COMPLIANCE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assemblePartnerQualityComplianceReview({
    networkSlug: input?.networkSlug ?? PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG,
    approvedItemIds,
  });
}
