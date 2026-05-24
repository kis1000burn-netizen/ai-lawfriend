/**
 * Product Phase 30-D — Enterprise security review pack service.
 */
import { assembleEnterpriseSecurityReviewPack } from "./enterprise-security-review-pack.policy";
import { ENTERPRISE_SECURITY_REVIEW_ITEMS } from "./enterprise-security-review-pack.registry";
import type { EnterpriseSecurityReviewPackResult } from "./enterprise-security-review-pack.schema";

export const ENTERPRISE_SECURITY_REVIEW_SERVICE_MARKER_PHASE30D =
  "phase30d-enterprise-security-review-service" as const;

export function buildEnterpriseSecurityReviewPack(input?: {
  approvedItemIds?: string[];
}): EnterpriseSecurityReviewPackResult {
  const approvedItemIds = new Set(
    input?.approvedItemIds ?? ENTERPRISE_SECURITY_REVIEW_ITEMS.map((i) => i.itemId),
  );

  return assembleEnterpriseSecurityReviewPack({ approvedItemIds });
}
