/**
 * Product Phase 30-D — Enterprise security review pack policy SSOT.
 */
import { ENTERPRISE_SECURITY_REVIEW_ITEMS } from "./enterprise-security-review-pack.registry";
import type { EnterpriseSecurityReviewPackResult } from "./enterprise-security-review-pack.schema";
import { ENTERPRISE_SECURITY_REVIEW_VERSION } from "./enterprise-security-review-pack.schema";

export const ENTERPRISE_SECURITY_REVIEW_POLICY_MARKER_PHASE30D =
  "phase30d-enterprise-security-review-policy" as const;

export function assembleEnterpriseSecurityReviewPack(input: {
  approvedItemIds: Set<string>;
  generatedAt?: string;
}): EnterpriseSecurityReviewPackResult {
  const items = ENTERPRISE_SECURITY_REVIEW_ITEMS.map((item) => ({
    ...item,
    approved: input.approvedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const approvedRequired = required.filter((item) => item.approved).length;
  const approvalRate =
    required.length === 0 ? 100 : Math.round((approvedRequired / required.length) * 100);

  return {
    version: ENTERPRISE_SECURITY_REVIEW_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    approvalRate,
    securityReviewPackReady: approvedRequired === required.length,
  };
}
