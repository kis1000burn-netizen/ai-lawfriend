/**
 * Product Phase 29-B — Customer success activity policy SSOT.
 */
import type { CustomerSuccessActivitySummary } from "./customer-success-activity.schema";
import { CUSTOMER_SUCCESS_ACTIVITY_VERSION } from "./customer-success-activity.schema";

export const CUSTOMER_SUCCESS_ACTIVITY_POLICY_MARKER_PHASE29B =
  "phase29b-customer-success-activity-policy" as const;

export const CUSTOMER_SUCCESS_MIN_ACTIVITY_COUNT = 1 as const;

export function assembleCustomerSuccessActivitySummary(input: {
  tenantId: string;
  activities: CustomerSuccessActivitySummary["recentActivities"];
}): CustomerSuccessActivitySummary {
  return {
    version: CUSTOMER_SUCCESS_ACTIVITY_VERSION,
    tenantId: input.tenantId,
    activityCount: input.activities.length,
    recentActivities: input.activities,
    csActivityLogReady: input.activities.length >= CUSTOMER_SUCCESS_MIN_ACTIVITY_COUNT,
  };
}
