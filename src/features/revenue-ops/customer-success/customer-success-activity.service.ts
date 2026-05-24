/**
 * Product Phase 29-B — Customer success activity service.
 */
import { assembleCustomerSuccessActivitySummary } from "./customer-success-activity.policy";
import {
  createCustomerSuccessActivity,
  listCustomerSuccessActivitiesByTenant,
} from "./customer-success-activity.repository";
import type {
  CustomerSuccessActivitySummary,
  RecordCustomerSuccessActivityInput,
} from "./customer-success-activity.schema";

export const CUSTOMER_SUCCESS_ACTIVITY_SERVICE_MARKER_PHASE29B =
  "phase29b-customer-success-activity-service" as const;

export async function recordCustomerSuccessActivity(
  input: RecordCustomerSuccessActivityInput,
) {
  return createCustomerSuccessActivity(input);
}

export async function getCustomerSuccessActivitySummaryForTenant(
  tenantId: string,
): Promise<CustomerSuccessActivitySummary> {
  const rows = await listCustomerSuccessActivitiesByTenant(tenantId);
  const activities = rows.map((row) => ({
    id: row.id,
    tenantId: row.tenantId,
    activityType: row.activityType,
    summary: row.summary,
    ownerUserId: row.ownerUserId ?? undefined,
    riskSignal: row.riskSignal ?? undefined,
    nextActionAt: row.nextActionAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
  }));

  return assembleCustomerSuccessActivitySummary({ tenantId, activities });
}
