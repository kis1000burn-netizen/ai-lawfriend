/**
 * Product Phase 31-E — Partner quality / compliance review policy SSOT.
 */
import { PARTNER_COMPLIANCE_ITEMS } from "./partner-quality-compliance.registry";
import type { PartnerQualityComplianceReviewResult } from "./partner-quality-compliance.schema";
import { PARTNER_QUALITY_COMPLIANCE_VERSION } from "./partner-quality-compliance.schema";

export const PARTNER_QUALITY_COMPLIANCE_POLICY_MARKER_PHASE31E =
  "phase31e-partner-quality-compliance-policy" as const;

export function assemblePartnerQualityComplianceReview(input: {
  networkSlug: string;
  approvedItemIds: Set<string>;
  generatedAt?: string;
}): PartnerQualityComplianceReviewResult {
  const items = PARTNER_COMPLIANCE_ITEMS.map((item) => ({
    ...item,
    approved: input.approvedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const approvedRequired = required.filter((item) => item.approved).length;
  const approvalRate =
    required.length === 0 ? 100 : Math.round((approvedRequired / required.length) * 100);

  return {
    version: PARTNER_QUALITY_COMPLIANCE_VERSION,
    networkSlug: input.networkSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    approvalRate,
    partnerComplianceReady: approvedRequired === required.length,
  };
}
